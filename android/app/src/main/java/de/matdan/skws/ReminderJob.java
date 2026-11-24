package de.matdan.skws;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Locale;

/**
 * Prüft zweimal täglich im Hintergrund, ob die Werte des gewählten Spielers älter als 7 Tage sind
 * (Benachrichtigung höchstens alle 2 Tage), und ob eine Event-Anmeldung offen ist, auf die der Spieler
 * noch nicht geantwortet hat und deren Anmeldeschluss in weniger als 36 Stunden ist (einmal pro Runde).
 */
public class ReminderJob extends JobService {

    static final int JOB_ID = 4711;
    static final String PREFS = "skws";
    static final String CHANNEL = "reminder";
    private static final String API = "https://ulwuoxfglmlcdppdegml.supabase.co/rest/v1/rpc/get_init";
    private static final String KEY = "sb_publishable_f9uikP8ZEHD7leJtckyKbg_E-jLm_Nn";
    private static final long DAY = 86_400_000L;
    private static final long STALE = 7 * DAY;
    private static final long SNOOZE = 2 * DAY;

    /* ---------- Planung ---------- */

    static void schedule(Context c) {
        JobScheduler js = c.getSystemService(JobScheduler.class);
        JobInfo job = new JobInfo.Builder(JOB_ID, new ComponentName(c, ReminderJob.class))
                .setPeriodic(DAY / 2)                       // zweimal täglich prüfen, das System bündelt die Läufe
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .setPersisted(true)                         // überlebt Neustarts
                .build();
        js.schedule(job);
    }

    static void cancel(Context c) {
        c.getSystemService(JobScheduler.class).cancel(JOB_ID);
    }

    /* ---------- Ausführung ---------- */

    @Override
    public boolean onStartJob(JobParameters params) {
        new Thread(() -> {
            boolean retry = false;
            try { check(this); } catch (Exception e) { retry = true; }
            jobFinished(params, retry);
        }).start();
        return true;
    }

    @Override
    public boolean onStopJob(JobParameters params) { return true; }

    static void check(Context c) throws Exception {
        SharedPreferences p = c.getSharedPreferences(PREFS, MODE_PRIVATE);
        String name = p.getString("name", "");
        if (!p.getBoolean("on", false) || name.isEmpty()) return;
        long now = System.currentTimeMillis();
        JSONObject data = new JSONObject(post(API, "{}"));
        checkEvents(c, p, data, name, now);
        if (now - p.getLong("lastNotified", 0) < SNOOZE) return;

        JSONObject entries = data.optJSONObject("entries");
        JSONObject e = entries == null ? null : entries.optJSONObject(name);
        boolean never = e == null;
        long updated = never ? 0 : OffsetDateTime.parse(e.getString("updated")).toInstant().toEpochMilli();
        if (!never && now - updated < STALE) return;

        int days = never ? -1 : (int) ((now - updated) / DAY);
        notify(c, name, days);
        p.edit().putLong("lastNotified", now).apply();
    }

    /** Offene Anmelderunde (Wüstensturm/Schluchtsturm) ohne Antwort des Spielers kurz vor Anmeldeschluss */
    static void checkEvents(Context c, SharedPreferences p, JSONObject data, String name, long now) {
        JSONObject ev = data.optJSONObject("ev");
        if (ev == null) return;
        for (String kind : new String[]{ "ds", "cs" }) {
            JSONObject r = ev.optJSONObject(kind);
            if (r == null || !r.optBoolean("open", false)) continue;
            JSONObject su = r.optJSONObject("signups");
            if (su != null && su.has(name)) continue;
            String key = "evNotified_" + r.optInt("id");
            if (p.getBoolean(key, false)) continue;
            long dl = 0;
            try { if (!r.isNull("deadline")) dl = OffsetDateTime.parse(r.getString("deadline")).toInstant().toEpochMilli(); } catch (Exception ignored) { }
            if (dl == 0 || dl < now || dl - now > 36 * 3_600_000L) continue;
            notifyEvent(c, name, kind, r.optString("label", ""), dl);
            p.edit().putBoolean(key, true).apply();
        }
    }

    static void notifyEvent(Context c, String name, String kind, String label, long deadline) {
        if (!canNotify(c)) return;
        boolean de = Locale.getDefault().getLanguage().equals("de");
        String ev = kind.equals("cs") ? (de ? "Schluchtsturm" : "Canyon Storm") : (de ? "Wüstensturm" : "Desert Storm");
        String when = new java.text.SimpleDateFormat(de ? "EEE HH:mm" : "EEE h:mm a", Locale.getDefault()).format(new java.util.Date(deadline));
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        nm.createNotificationChannel(new NotificationChannel(CHANNEL,
                de ? "Squad-Erinnerung" : "Squad reminder", NotificationManager.IMPORTANCE_DEFAULT));
        String title = de ? "SKWS – Anmeldung " + ev : "SKWS – " + ev + " sign-up";
        String text = de ? name + ", du hast dich für " + ev + " " + label + " noch nicht gemeldet. Anmeldeschluss: " + when + "."
                         : name + ", you haven't answered the " + ev + " " + label + " sign-up yet. Deadline: " + when + ".";
        Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, 1, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification n = new Notification.Builder(c, CHANNEL)
                .setSmallIcon(R.drawable.ic_notify)
                .setColor(0xFF5CC8FF)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new Notification.BigTextStyle().bigText(text))
                .setContentIntent(pi)
                .setAutoCancel(true)
                .build();
        nm.notify(kind.equals("cs") ? 3 : 2, n);
    }

    static String post(String url, String body) throws Exception {
        HttpURLConnection con = (HttpURLConnection) new URL(url).openConnection();
        con.setConnectTimeout(15000);
        con.setReadTimeout(15000);
        con.setRequestMethod("POST");
        con.setRequestProperty("apikey", KEY);
        con.setRequestProperty("Content-Type", "application/json");
        con.setDoOutput(true);
        try (OutputStream os = con.getOutputStream()) { os.write(body.getBytes(StandardCharsets.UTF_8)); }
        if (con.getResponseCode() != 200) throw new IllegalStateException("HTTP " + con.getResponseCode());
        try (InputStream in = con.getInputStream()) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            return out.toString("UTF-8");
        }
    }

    /* ---------- Benachrichtigung ---------- */

    static boolean canNotify(Context c) {
        if (Build.VERSION.SDK_INT >= 33
                && c.checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return false;
        return c.getSystemService(NotificationManager.class).areNotificationsEnabled();
    }

    /** days = -1: noch nie eingetragen, -2: Test */
    static void notify(Context c, String name, int days) {
        if (!canNotify(c)) return;
        boolean de = Locale.getDefault().getLanguage().equals("de");
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        nm.createNotificationChannel(new NotificationChannel(CHANNEL,
                de ? "Squad-Erinnerung" : "Squad reminder", NotificationManager.IMPORTANCE_DEFAULT));

        String title, text;
        if (days == -2) {
            title = de ? "SKWS – Test" : "SKWS – test";
            text = de ? "So sieht deine Erinnerung aus, " + name + "." : "This is what your reminder looks like, " + name + ".";
        } else if (days == -1) {
            title = de ? "SKWS – Squads eintragen" : "SKWS – enter your squads";
            text = de ? name + ", du hast deine Squads noch nicht eingetragen." : name + ", you haven't entered your squads yet.";
        } else {
            title = de ? "SKWS – Zeit für ein Update" : "SKWS – time for an update";
            text = de ? name + ", deine Squad-Werte sind " + days + " Tage alt. Bitte jetzt aktualisieren."
                      : name + ", your squad values are " + days + " days old. Please update them now.";
        }

        Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, 0, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        Notification n = new Notification.Builder(c, CHANNEL)
                .setSmallIcon(R.drawable.ic_notify)
                .setColor(0xFF5CC8FF)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new Notification.BigTextStyle().bigText(text))
                .setContentIntent(pi)
                .setAutoCancel(true)
                .build();
        nm.notify(1, n);
    }
}
