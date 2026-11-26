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
 * (Benachrichtigung höchstens alle 2 Tage), ob eine Event-Anmeldung offen ist, auf die der Spieler
 * noch nicht geantwortet hat und deren Anmeldeschluss in weniger als 36 Stunden ist (einmal pro Runde),
 * ob es neue Umfragen gibt (einmal pro Umfrage) und stellt einen Wecker ca. 30 Minuten vor dem eigenen Einsatz.
 * Wer als abwesend eingetragen ist, bekommt keine Erinnerungen.
 */
public class ReminderJob extends JobService {

    static final int JOB_ID = 4711;
    static final String PREFS = "skws";
    static final String CHANNEL = "reminder";
    private static final String API = "https://ulwuoxfglmlcdppdegml.supabase.co/rest/v1/rpc/get_init";
    private static final String INFO = "https://ulwuoxfglmlcdppdegml.supabase.co/rest/v1/rpc/reminder_info";
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
        // Abwesend eingetragen: keine Erinnerungen
        JSONObject info = null;
        try { info = new JSONObject(post(INFO, new JSONObject().put("p_name", name).toString())); } catch (Exception ignored) { }
        if (info != null && info.optBoolean("away", false)) return;
        checkEvents(c, p, data, name, now);
        if (info != null) checkPolls(c, p, info, name);
        scheduleAssignment(c, data, name, now);
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

    /** Neue Umfragen, bei denen der Spieler noch nicht abgestimmt hat (je Umfrage nur einmal) */
    static void checkPolls(Context c, SharedPreferences p, JSONObject info, String name) {
        org.json.JSONArray ids = info.optJSONArray("polls");
        if (ids == null || ids.length() == 0) return;
        String done = p.getString("pollsNotified", ",");
        int fresh = 0;
        StringBuilder add = new StringBuilder(done);
        for (int i = 0; i < ids.length(); i++) {
            String id = "," + ids.optLong(i) + ",";
            if (done.contains(id)) continue;
            fresh++; add.append(ids.optLong(i)).append(",");
        }
        if (fresh == 0) return;
        String keep = add.toString(); if (keep.length() > 2000) keep = "," + keep.substring(keep.length() - 1500);
        p.edit().putString("pollsNotified", keep).apply();
        boolean de = Locale.getDefault().getLanguage().equals("de");
        show(c, 4, de ? "SKWS – Neue Umfrage" : "SKWS – New poll",
                de ? name + ", es gibt " + (fresh == 1 ? "eine neue Umfrage" : fresh + " neue Umfragen") + ". Du findest sie unter „Events“."
                   : name + ", there " + (fresh == 1 ? "is a new poll" : "are " + fresh + " new polls") + ". You'll find them under “Events”.");
    }

    /** Eigener Einsatz (Wüstensturm/Schluchtsturm): Wecker ca. 30 Minuten vor Beginn stellen */
    static void scheduleAssignment(Context c, JSONObject data, String name, long now) {
        for (String kind : new String[]{ "ds", "cs" }) {
            JSONObject plan = data.optJSONObject(kind);
            JSONObject teams = plan == null ? null : plan.optJSONObject("teams");
            if (teams == null) continue;
            java.util.Iterator<String> it = teams.keys();
            while (it.hasNext()) {
                String t = it.next();
                JSONObject team = teams.optJSONObject(t);
                if (team == null || !inTeam(team, name)) continue;
                long at = nextTime(team.optString("time", ""), now);
                if (at <= 0) continue;
                long fire = at - 30 * 60_000L;
                if (fire <= now || at - now > 7 * DAY) continue;
                Intent i = new Intent(c, EventAlarm.class).putExtra("kind", kind).putExtra("team", t).putExtra("name", name).putExtra("at", at);
                PendingIntent pi = PendingIntent.getBroadcast(c, kind.equals("cs") ? 11 : 10, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
                c.getSystemService(android.app.AlarmManager.class).setAndAllowWhileIdle(android.app.AlarmManager.RTC_WAKEUP, fire, pi);
            }
        }
    }

    static boolean inTeam(JSONObject team, String name) {
        org.json.JSONArray m = team.optJSONArray("m"), s = team.optJSONArray("s");
        if (m != null) for (int i = 0; i < m.length(); i++) { org.json.JSONArray x = m.optJSONArray(i); if (x != null && name.equals(x.optString(0))) return true; }
        if (s != null) for (int i = 0; i < s.length(); i++) if (name.equals(s.optString(i))) return true;
        return false;
    }

    /** „Fr 21:00“ / „Freitag 21:00“ / „Fri 21:00“ (deutsche Zeit) → nächster Zeitpunkt in Millisekunden, 0 wenn nicht lesbar */
    static long nextTime(String txt, long now) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("^\\s*(?:([A-Za-zÄÖÜäöü]+)\\.?,?\\s*)?(\\d{1,2})[:.](\\d{2})").matcher(txt);
        if (!m.find()) return 0;
        int wd = -1;
        if (m.group(1) != null) {
            String w = m.group(1).toLowerCase(Locale.ROOT);
            String[][] map = { {"mo","1"},{"di","2"},{"mi","3"},{"do","4"},{"fr","5"},{"sa","6"},{"so","7"},{"mon","1"},{"tue","2"},{"wed","3"},{"thu","4"},{"fri","5"},{"sat","6"},{"sun","7"} };
            for (String[] e : map) if (w.startsWith(e[0]) && (e[0].length() == 3 || wd < 0)) wd = Integer.parseInt(e[1]);
            if (wd < 0) return 0;
        }
        java.time.ZoneId z = java.time.ZoneId.of("Europe/Berlin");
        java.time.ZonedDateTime n = java.time.Instant.ofEpochMilli(now).atZone(z);
        java.time.ZonedDateTime t = n.withHour(Integer.parseInt(m.group(2))).withMinute(Integer.parseInt(m.group(3))).withSecond(0).withNano(0);
        if (wd > 0) { int add = (wd - n.getDayOfWeek().getValue() + 7) % 7; t = t.plusDays(add); }
        if (t.toInstant().toEpochMilli() < now - 60 * 60_000L) t = t.plusDays(wd > 0 ? 7 : 1);
        return t.toInstant().toEpochMilli();
    }

    static void show(Context c, int id, String title, String text) {
        if (!canNotify(c)) return;
        boolean de = Locale.getDefault().getLanguage().equals("de");
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        nm.createNotificationChannel(new NotificationChannel(CHANNEL, de ? "Squad-Erinnerung" : "Squad reminder", NotificationManager.IMPORTANCE_DEFAULT));
        Intent open = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, id, open, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        nm.notify(id, new Notification.Builder(c, CHANNEL).setSmallIcon(R.drawable.ic_notify).setColor(0xFF5CC8FF)
                .setContentTitle(title).setContentText(text).setStyle(new Notification.BigTextStyle().bigText(text))
                .setContentIntent(pi).setAutoCancel(true).build());
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
