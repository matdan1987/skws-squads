package de.matdan.skws;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import java.util.Locale;

/** Erinnerung ca. 30 Minuten vor dem eigenen Wüstensturm-/Schluchtsturm-Einsatz (gestellt von ReminderJob) */
public class EventAlarm extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent i) {
        if (!c.getSharedPreferences(ReminderJob.PREFS, Context.MODE_PRIVATE).getBoolean("on", false)) return;
        boolean de = Locale.getDefault().getLanguage().equals("de");
        String kind = i.getStringExtra("kind"), team = i.getStringExtra("team"), name = i.getStringExtra("name");
        String ev = "cs".equals(kind) ? (de ? "Schluchtsturm" : "Canyon Storm") : (de ? "Wüstensturm" : "Desert Storm");
        String when = new java.text.SimpleDateFormat("HH:mm", Locale.getDefault()).format(new java.util.Date(i.getLongExtra("at", System.currentTimeMillis())));
        ReminderJob.show(c, "cs".equals(kind) ? 6 : 5, de ? "SKWS – " + ev + " gleich!" : "SKWS – " + ev + " soon!",
                de ? (name != null ? name + ", " : "") + "dein Einsatz bei " + ev + " (Team " + team + ") beginnt um " + when + ". Deinen Plan findest du unter „Events“."
                   : (name != null ? name + ", " : "") + "your " + ev + " assignment (Team " + team + ") starts at " + when + ". Your plan is under “Events”.");
    }
}
