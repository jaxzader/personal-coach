/* ============================================================
   PERSONAL COACH — STATIC REFERENCE DATA
   Evidence-based behavior-change technique + effects library.
   This is hardcoded reference content, not AI-generated advice —
   the app organizes/tracks; deeper analysis happens in Claude.
   ============================================================ */

const HABIT_CATEGORIES = [
  {
    id: "procrastination",
    label: "Procrastination",
    techniques: [
      { name: "The Two-Minute Rule",
        body: "If a task (or the very next physical action of one) takes less than two minutes, do it immediately instead of deferring it — breaks the inertia of starting." },
      { name: "Implementation Intentions (If-Then Planning)",
        body: "\"If it's 9am, then I open the document and write for 10 minutes\" — ties the task to a concrete time/place cue instead of a vague intention." },
      { name: "Time-Boxing / Pomodoro Technique",
        body: "Commit to a short fixed interval (often 25 minutes) of focused work on one task, followed by a real break — shrinks how big the task feels." },
      { name: "Temptation Bundling",
        body: "Pair a task you avoid with something you enjoy (e.g. only listen to a favorite podcast while doing the dreaded task) so starting feels less aversive." },
      { name: "Premack Principle",
        body: "Use a high-preference activity you'd do anyway as the reward that's contingent on finishing the lower-preference task first." },
      { name: "Next-Action Definition",
        body: "Procrastination often targets vague tasks. Breaking a task down until the very next physical action is completely unambiguous lowers the activation energy needed to start." },
      { name: "Fresh Start Effect",
        body: "Behavior-change attempts succeed more often when anchored to a temporal landmark (Monday, the 1st of the month, a birthday) — useful for restarting after a lapse." }
    ],
    effects: {
      physical: "Chronic procrastination is linked to elevated stress hormones and poorer sleep from last-minute crunches, and delayed engagement with health tasks (checkups, exercise) compounds over time.",
      mental: "A recurring stress-relief-then-guilt cycle — short-term relief from avoidance, followed by anticipatory anxiety that grows the longer a task is deferred.",
      financial: "Late fees, rushed work quality, and missed opportunities (applications, discounts, promotions) have a real measurable cost over time.",
      relational: "Repeatedly being late or unreliable erodes others' trust, and can shift you into being \"the one who always does things last minute\" in ways that affect how people rely on you."
    }
  },
  {
    id: "doomscrolling",
    label: "Doomscrolling / Phone Overuse",
    techniques: [
      { name: "Friction Addition (Environment Design)",
        body: "Increase the number of steps to open the app — log out after each use, move it off the home screen, use grayscale display — so opening it takes deliberate effort instead of being an automatic reflex." },
      { name: "Implementation Intentions (If-Then Planning)",
        body: "\"If I feel the urge to check my phone while waiting, then I take three breaths and look up instead.\"" },
      { name: "Habit Loop Disruption",
        body: "Identify the real cue (boredom, anxiety, a lull) and the real reward you're seeking (stimulation, distraction, connection), then find a substitute that provides it at lower cost (a fidget object, a short playlist, texting one specific person)." },
      { name: "Scheduled Scroll Windows",
        body: "Instead of trying to eliminate scrolling entirely, contain it to specific times of day — reduces the all-day low-grade pull to check." },
      { name: "App Timers / Hard Stops",
        body: "Built-in screen-time limits act as a commitment device, forcing a pause point rather than relying on in-the-moment willpower." },
      { name: "Physical Distance",
        body: "Charging your phone outside the bedroom or in another room during focus/sleep periods removes the cue entirely instead of requiring resistance." }
    ],
    effects: {
      physical: "Later bedtimes and disrupted sleep from blue light and mental stimulation before bed, eye strain, and reduced physical activity from extended sitting/scrolling sessions.",
      mental: "Doomscrolling specifically is linked to heightened anxiety and helplessness; social comparison from feeds is linked to lower mood and self-esteem; constant task-switching fragments attention and makes sustained focus harder over time.",
      financial: "Time lost to scrolling has a real opportunity cost against paid work, skill-building, or side income, and targeted ads/impulse exposure can drive unplanned spending.",
      relational: "\"Phubbing\" (being visibly distracted by your phone around others) is linked to lower relationship satisfaction and reduced quality of in-person connection."
    }
  },
  {
    id: "sleepSchedule",
    label: "Inconsistent Sleep Schedule",
    techniques: [
      { name: "Fixed Wake Time",
        body: "Anchor the same wake-up time every day, including weekends. A consistent wake time stabilizes your body clock faster than trying to force an earlier bedtime." },
      { name: "Implementation Intentions (If-Then Planning)",
        body: "\"If it's 10:30pm, then I put my phone on the charger across the room and start winding down.\"" },
      { name: "Wind-Down Routine",
        body: "A short, repeatable 20–30 minute routine before bed (dim lights, no work, same order every night) acts as a cue that makes falling asleep easier." },
      { name: "Stimulus Control",
        body: "Use the bed only for sleep. If you can't fall asleep after about 20 minutes, get up and do something calm until you feel sleepy, so the bed stays linked with sleep." },
      { name: "Self-Monitoring",
        body: "Log bedtime and wake time for a week before changing anything. Seeing the real pattern makes it easier to pick one realistic fix." }
    ],
    effects: {
      physical: "Irregular sleep is linked to lower energy, weaker recovery from exercise, and more frequent sickness over time.",
      mental: "Short or irregular sleep makes focus, memory, and mood noticeably worse the next day, which makes every other habit harder to keep.",
      financial: "Tired days mean slower work and more convenience spending (extra coffee, takeout, rideshares).",
      relational: "Being exhausted or running late chips away at patience and reliability with the people around you."
    }
  },
  {
    id: "skippingExercise",
    label: "Skipping Workouts",
    techniques: [
      { name: "Habit Stacking",
        body: "Attach the workout to something you already do every day: \"After my last class, I go straight to the gym before going home.\"" },
      { name: "Lower the Starting Bar",
        body: "Commit to just 10 minutes or one exercise. Starting is the hard part; most days you'll keep going once you're there." },
      { name: "Environment Design",
        body: "Pack your gym bag the night before and leave it by the door, so the next step is obvious and takes no planning." },
      { name: "Social Accountability",
        body: "Schedule workouts with a friend or tell someone your plan for the week. It's harder to quietly skip something another person expects." },
      { name: "Streak Tracking",
        body: "Mark each completed workout. Seeing a streak you don't want to break is a simple, proven motivator." }
    ],
    effects: {
      physical: "Less strength, stamina, and energy over time, plus a higher long-term risk of health problems tied to inactivity.",
      mental: "Regular exercise is one of the most reliable ways to improve mood, stress, and focus, so skipping it removes an easy win.",
      financial: "Paying for a gym membership you don't use is a direct cost, and long-term inactivity raises health costs later.",
      relational: "Workouts can be shared time with friends; skipping them can mean less of that connection."
    }
  },
  {
    id: "impulseSpending",
    label: "Impulse Spending",
    techniques: [
      { name: "24-Hour Rule",
        body: "For any non-essential purchase over a set amount, wait 24 hours before buying. Many urges fade on their own." },
      { name: "Friction Addition",
        body: "Remove saved cards from shopping apps and log out of stores, so buying takes deliberate extra steps." },
      { name: "Implementation Intentions (If-Then Planning)",
        body: "\"If I add something to my cart, then I close the app and add it to a wishlist instead.\"" },
      { name: "Weekly Spending Check-In",
        body: "Spend five minutes each week reviewing what you bought. Awareness alone tends to reduce unplanned spending." },
      { name: "Unsubscribe From Triggers",
        body: "Unsubscribe from sale emails and mute shopping notifications to cut down the cues that start the urge." }
    ],
    effects: {
      physical: "Minimal direct effect, though money stress can affect sleep and energy.",
      mental: "Short-term excitement is often followed by regret, and ongoing money stress adds background anxiety.",
      financial: "Small unplanned purchases add up quickly and crowd out savings goals.",
      relational: "Money stress is a common source of tension with family, partners, and roommates."
    }
  },
  {
    id: "multitasking",
    label: "Multitasking / Context Switching",
    techniques: [
      { name: "Single-Tasking Blocks",
        body: "Work on one task at a time for a set block (for example 25–45 minutes) with everything else closed." },
      { name: "Batching",
        body: "Group similar small tasks, like email and messages, into one or two set times a day instead of reacting all day." },
      { name: "Distraction Parking Lot",
        body: "Keep a notepad open and write down unrelated thoughts as they come, then return to the task instead of acting on them." },
      { name: "Notification Control",
        body: "Turn off non-essential notifications during focus blocks so interruptions don't decide what you work on." },
      { name: "Next-Action Definition",
        body: "Before switching away, write the exact next step for the current task so it's easy to pick back up." }
    ],
    effects: {
      physical: "Long unfocused sessions often mean more screen time and sitting than the work actually needed.",
      mental: "Constant switching makes tasks take longer, increases mistakes, and leaves you feeling busy but behind.",
      financial: "Lower-quality, slower work has a real cost for school, jobs, and side businesses.",
      relational: "Half-listening while doing other things makes people feel less heard."
    }
  }
];

function findHabitCategory(id) {
  return HABIT_CATEGORIES.find(c => c.id === id) || null;
}
