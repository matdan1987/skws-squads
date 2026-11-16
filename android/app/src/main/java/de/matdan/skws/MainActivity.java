package de.matdan.skws;

import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * SKWS Squads – schlanker Rahmen um die Webseite.
 * Seite + Admin-Bereich laufen unverändert, dazu: Datei-Export nach Downloads und Kopieren in die Zwischenablage.
 */
public class MainActivity extends Activity {

    private static final String HOME = "https://matdan1987.github.io/skws-squads/";
    private static final String HOST = "matdan1987.github.io";
    private static final int BG = Color.parseColor("#070B14");

    private WebView web;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(BG);
        web = new WebView(this);
        web.setBackgroundColor(BG);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        // Android 15+ zeichnet randlos – Statusleiste und Navigationsleiste freihalten
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int top, bottom, left, right;
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets i = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
                top = i.top; bottom = i.bottom; left = i.left; right = i.right;
            } else {
                top = insets.getSystemWindowInsetTop(); bottom = insets.getSystemWindowInsetBottom();
                left = insets.getSystemWindowInsetLeft(); right = insets.getSystemWindowInsetRight();
            }
            v.setPadding(left, top, right, bottom);
            return insets;
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setUserAgentString(s.getUserAgentString() + " SKWSApp/1.0");

        web.addJavascriptInterface(new Bridge(this), "SKWSAndroid");
        web.setWebChromeClient(new WebChromeClient());   // zeigt confirm()/prompt() als Android-Dialoge
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (!req.isForMainFrame()) return;
                String html = "<html><head><meta name='viewport' content='width=device-width,initial-scale=1'></head>"
                        + "<body style='margin:0;background:#070b14;color:#e6edf7;font-family:sans-serif;display:flex;align-items:center;"
                        + "justify-content:center;height:100vh;text-align:center'><div style='padding:24px'>"
                        + "<div style='color:#5cc8ff;letter-spacing:.2em;font-size:13px'>SKWS – SKYWALKERS</div>"
                        + "<p style='font-size:18px'>Keine Verbindung.<br><span style='color:#8a9bb8;font-size:15px'>No connection.</span></p>"
                        + "<button onclick=\"location.href='" + HOME + "'\" style='border:0;border-radius:12px;padding:14px 22px;font-size:16px;"
                        + "font-weight:700;background:linear-gradient(135deg,#5cc8ff,#7c5cff);color:#06101f'>Erneut versuchen</button>"
                        + "</div></body></html>";
                view.loadDataWithBaseURL(HOME, html, "text/html", "utf-8", null);
            }
        });

        if (state != null) web.restoreState(state);
        else web.loadUrl(HOME);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    /** Für die Webseite erreichbar als window.SKWSAndroid */
    static class Bridge {
        private final Activity act;
        Bridge(Activity a) { act = a; }

        /** Status der Handy-Erinnerung als JSON: {"on":true,"name":"...","perm":true} */
        @JavascriptInterface
        public String getReminder() {
            android.content.SharedPreferences p = act.getSharedPreferences(ReminderJob.PREFS, MODE_PRIVATE);
            try {
                return new org.json.JSONObject()
                        .put("on", p.getBoolean("on", false))
                        .put("name", p.getString("name", ""))
                        .put("perm", ReminderJob.canNotify(act)).toString();
            } catch (Exception e) { return "{}"; }
        }

        @JavascriptInterface
        public void setReminder(boolean on, String name) {
            act.getSharedPreferences(ReminderJob.PREFS, MODE_PRIVATE).edit()
                    .putBoolean("on", on).putString("name", name == null ? "" : name).apply();
            if (on) {
                askPermission();
                ReminderJob.schedule(act);
                new Thread(() -> { try { ReminderJob.check(act); } catch (Exception ignored) { } }).start();
            } else {
                ReminderJob.cancel(act);
            }
        }

        @JavascriptInterface
        public void testNotification(String name) {
            askPermission();
            new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(
                    () -> ReminderJob.notify(act, name == null || name.isEmpty() ? "SKWS" : name, -2), 600);
        }

        private void askPermission() {
            if (Build.VERSION.SDK_INT >= 33
                    && act.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                act.runOnUiThread(() -> act.requestPermissions(new String[]{ android.Manifest.permission.POST_NOTIFICATIONS }, 1));
            }
        }

        @JavascriptInterface
        public void copy(String text) {
            act.runOnUiThread(() -> {
                ClipboardManager cm = (ClipboardManager) act.getSystemService(Context.CLIPBOARD_SERVICE);
                cm.setPrimaryClip(ClipData.newPlainText("SKWS", text));
                if (Build.VERSION.SDK_INT < 33) Toast.makeText(act, "Kopiert", Toast.LENGTH_SHORT).show();
            });
        }

        @JavascriptInterface
        public boolean saveFile(String name, String content, String mime) {
            if (Build.VERSION.SDK_INT >= 29) {
                try {
                    ContentValues v = new ContentValues();
                    v.put(MediaStore.Downloads.DISPLAY_NAME, name);
                    v.put(MediaStore.Downloads.MIME_TYPE, mime);
                    v.put(MediaStore.Downloads.RELATIVE_PATH, "Download/SKWS");
                    Uri uri = act.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                    if (uri == null) throw new IllegalStateException("insert failed");
                    try (OutputStream os = act.getContentResolver().openOutputStream(uri)) {
                        os.write(content.getBytes(StandardCharsets.UTF_8));
                    }
                    act.runOnUiThread(() -> Toast.makeText(act, "Gespeichert: Downloads/SKWS/" + name, Toast.LENGTH_LONG).show());
                    return true;
                } catch (Exception e) {
                    // weiter mit Teilen
                }
            }
            act.runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType("text/plain");
                i.putExtra(Intent.EXTRA_SUBJECT, name);
                i.putExtra(Intent.EXTRA_TEXT, content);
                act.startActivity(Intent.createChooser(i, name));
            });
            return true;
        }
    }
}
