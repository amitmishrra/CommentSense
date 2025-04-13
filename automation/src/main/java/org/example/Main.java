package org.example;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.devtools.DevTools;
import org.openqa.selenium.devtools.v129.network.Network;
import org.openqa.selenium.devtools.v129.network.model.RequestId;
import org.openqa.selenium.devtools.v129.network.model.Response;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

import com.google.gson.Gson;

public class Main {

    private static boolean isGoodComment(String comment) {
        if (comment == null || comment.trim().isEmpty()) return false;

        String noMentions = comment.replaceAll("@\\w+", "").trim();
        String noEmojis = noMentions.replaceAll("[\\p{So}\\p{Cn}]+", "").trim();
        int wordCount = noEmojis.split("\\s+").length;

        return wordCount >= 4 && noEmojis.matches(".*[a-zA-Z0-9].*");
    }

    private static void humanLikePause(int min, int max) throws InterruptedException {
        int delay = new Random().nextInt(max - min + 1) + min;
        Thread.sleep(delay);
    }

    public static void main(String[] args) throws Exception {
        WebDriverManager.chromedriver().setup();
        ChromeDriver driver = new ChromeDriver();

        DevTools devTools = driver.getDevTools();
        devTools.createSession();
        devTools.send(Network.enable(Optional.empty(), Optional.empty(), Optional.empty()));

        Set<String> uniqueComments = new LinkedHashSet<>();
        AtomicReference<Boolean> accountSuspended = new AtomicReference<>(false);

        devTools.addListener(Network.responseReceived(), responseReceived -> {
            Response response = responseReceived.getResponse();
            RequestId requestId = responseReceived.getRequestId();
            String url = response.getUrl();

            if (url.contains("suspended")) {
                System.out.println("⚠️ Suspicious activity detected. Exiting...");
                accountSuspended.set(true);
            }

            if (url.contains("graphql/query")) {
                try {
                    Network.GetResponseBodyResponse body = devTools.send(Network.getResponseBody(requestId));
                    String bodyText = body.getBody();

                    if (bodyText.contains("xdt_api__v1__media__media_id__comments")) {
                        String[] splits = bodyText.split("\"text\":\"");
                        for (int i = 1; i < splits.length; i++) {
                            String rawComment = splits[i].split("\"")[0];
                            String cleanComment = rawComment.replaceAll("\\\\n", " ").replaceAll("\\\\", "");

                            if (isGoodComment(cleanComment) && uniqueComments.add(cleanComment)) {
                                System.out.println("New Comment: " + cleanComment);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.out.println("Error fetching response body: " + e.getMessage());
                }
            }
        });

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("https://www.instagram.com/accounts/login/");
        humanLikePause(4000, 6000);
        driver.manage().window().maximize();

        driver.findElement(By.name("username")).sendKeys("username");
        driver.findElement(By.name("password")).sendKeys("password");
        driver.findElement(By.xpath("//button[@type='submit']")).click();

        humanLikePause(7000, 10000);

        WebElement reelsButton = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("(//*[@aria-label=\"Reels\"])[1]")));
        reelsButton.click();

        humanLikePause(4000, 6000);
        int index = 0;
        int interactionLimit = 30;

        while (uniqueComments.size() < 500 && !accountSuspended.get()) {
            if (interactionLimit <= 0) {
                System.out.println("⚠️ Interaction limit reached for this session. Taking a break...");
                break;
            }

            List<WebElement> commentButtons = driver.findElements(By.xpath("//*[@aria-label='Comment']"));

            if (index >= commentButtons.size()) {
                driver.navigate().refresh();
                System.out.println("Refreshed page for more reels.");
                humanLikePause(6000, 10000);
                index = 0;
                continue;
            }

            try {
                WebElement commentButton = commentButtons.get(index);

                if (commentButton.isDisplayed()) {
                    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", commentButton);
                    humanLikePause(1200, 1800);

                    wait.until(ExpectedConditions.elementToBeClickable(commentButton));
                    commentButton.click();

                    System.out.println("Clicked comment button #" + (index + 1));
                    humanLikePause(5000, 8000);
                    interactionLimit--;
                }
            } catch (Exception e) {
                System.out.println("Skipping button at index " + index + " due to error: " + e.getMessage());
            }

            index++;
            System.out.println("Total collected comments: " + uniqueComments.size());
        }

        driver.quit();

        String quotedComments = uniqueComments.stream()
                .map(comment -> "\"" + comment.replace("\"", "\\\"") + "\"")
                .collect(Collectors.joining(", ", "[", "]"));

        System.out.println("\nCollected Comments:");
        System.out.println(quotedComments);
        System.out.println("\nUploading collected comments...");

        uploadCommentsInChunks(new ArrayList<>(uniqueComments), "https://your-api-endpoint/comments/upload");
    }

    public static void uploadCommentsInChunks(List<String> comments, String apiUrl) {
        Gson gson = new Gson();
        int chunkSize = 100;
        int totalChunks = (int) Math.ceil(comments.size() / (double) chunkSize);

        for (int i = 0; i < comments.size(); i += chunkSize) {
            List<String> chunk = comments.subList(i, Math.min(i + chunkSize, comments.size()));
            Map<String, List<String>> payload = new HashMap<>();
            payload.put("comments", chunk);
            String json = gson.toJson(payload);

            try {
                HttpURLConnection connection = (HttpURLConnection) new URL(apiUrl).openConnection();
                connection.setRequestMethod("POST");
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setDoOutput(true);

                try (OutputStream os = connection.getOutputStream()) {
                    byte[] input = json.getBytes(StandardCharsets.UTF_8);
                    os.write(input, 0, input.length);
                }

                Scanner scanner = new Scanner(connection.getInputStream());
                StringBuilder responseStr = new StringBuilder();
                while (scanner.hasNext()) {
                    responseStr.append(scanner.nextLine());
                }
                scanner.close();

                System.out.printf("✅ Uploaded chunk %d/%d — %d comments\n", (i / chunkSize) + 1, totalChunks, chunk.size());
                System.out.println("API Response: " + responseStr.toString());

                Thread.sleep(1500); // pause between uploads

            } catch (Exception e) {
                System.out.println("❌ Failed to upload chunk " + (i / chunkSize + 1) + ": " + e.getMessage());
            }
        }
    }
}