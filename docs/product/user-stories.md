# User Stories — MVP

**Status:** Draft v1 · **Owner:** pm · **Source:** `PRD.md`

IDs: `US-LES-*` lessons and exercises, `US-GAM-*` gamification and path,
`US-PLT-*` platform, auth, profile and PWA. Priority: **P0** must ship in MVP,
**P1** should ship in MVP, **P2** nice to have (may slip to Phase 2).

Personas: **learner** (any user), **guest** (no account), **signed-in learner**,
**new visitor**.

---

## Lessons and exercises

| ID | Story | Priority |
|---|---|---|
| US-LES-01 | As a learner, I want to start a lesson from the skill path with one tap so that I can begin practising right away. | P0 |
| US-LES-02 | As a learner, I want to see a progress bar during a lesson so that I know how much is left. | P0 |
| US-LES-03 | As a learner, I want to answer multiple-choice questions so that I can recognise Spanish words and phrases. | P0 |
| US-LES-04 | As a learner, I want to build a translation from a bank of word tiles so that I can practise sentence structure without typing. | P0 |
| US-LES-05 | As a learner, I want to match Spanish words with their English translations so that I can practise vocabulary quickly. | P0 |
| US-LES-06 | As a learner, I want to hear a Spanish phrase and build what I heard so that I can train my listening. | P0 |
| US-LES-07 | As a learner, I want to replay listening audio at slow speed so that I can catch every word. | P1 |
| US-LES-08 | As a learner, I want to say a Spanish phrase out loud and have it checked so that I can practise speaking. | P2 |
| US-LES-09 | As a learner who can't speak right now, I want to skip speaking exercises (once or turn them off) so that I can keep learning in a quiet place. | P2 |
| US-LES-10 | As a learner, I want to press "Check" and get immediate correct/incorrect feedback so that I know how I did. | P0 |
| US-LES-11 | As a learner, I want to see the correct answer when I'm wrong so that I can learn from the mistake. | P0 |
| US-LES-12 | As a learner, I want the questions I got wrong to come back later in the same lesson so that I fix them before I finish. | P1 |
| US-LES-13 | As a learner, I want a results screen at the end of a lesson with XP, accuracy and time so that I feel a sense of achievement. | P0 |
| US-LES-14 | As a learner, I want to be asked to confirm before quitting a lesson so that I don't lose progress by accident. | P1 |
| US-LES-15 | As a keyboard or screen-reader user, I want to complete every exercise type without a mouse or touch screen so that the app is usable for me. | P0 |
| US-LES-16 | As a learner, I want a short tip at the start of a lesson so that I understand the new words or grammar idea. | P2 |

## Gamification and skill path

| ID | Story | Priority |
|---|---|---|
| US-GAM-01 | As a learner, I want to see the lessons of the unit as a path so that I know where I am and what comes next. | P0 |
| US-GAM-02 | As a learner, I want lessons to unlock in order when I finish the previous one so that I progress step by step. | P0 |
| US-GAM-03 | As a learner, I want to see which lessons are locked, available and completed so that I can understand my progress at a glance. | P0 |
| US-GAM-04 | As a learner, I want to earn XP for each lesson I finish so that my effort is rewarded. | P0 |
| US-GAM-05 | As a learner, I want bonus XP for a lesson with no mistakes so that I'm motivated to be accurate. | P1 |
| US-GAM-06 | As a learner, I want to set a daily XP goal so that the app matches how much time I have. | P0 |
| US-GAM-07 | As a learner, I want to see today's progress toward my daily goal so that I know whether to do one more lesson. | P0 |
| US-GAM-08 | As a learner, I want my streak to go up each day I complete a lesson so that I'm motivated to come back daily. | P0 |
| US-GAM-09 | As a learner, I want to see my current streak on the home screen so that I'm reminded not to break it. | P0 |
| US-GAM-10 | As a learner, I want to start each lesson knowing how many hearts I have so that I understand the stakes. | P0 |
| US-GAM-11 | As a learner, I want to lose a heart when I answer incorrectly so that accuracy matters. | P0 |
| US-GAM-12 | As a learner with no hearts, I want to see when my next heart refills so that I know when I can continue. | P0 |
| US-GAM-13 | As a learner, I want a celebration on the results screen when I extend my streak or hit my daily goal so that the milestone feels rewarding. | P1 |
| US-GAM-14 | As a learner, I want to replay a completed lesson for XP so that I can review and still make progress. | P1 |

## Platform: onboarding, auth, profile, PWA, offline

| ID | Story | Priority |
|---|---|---|
| US-PLT-01 | As a new visitor, I want to start learning without creating an account so that I can try the app first. | P0 |
| US-PLT-02 | As a new visitor, I want to pick the language I want to learn so that I get the right course. | P0 |
| US-PLT-03 | As a new visitor, I want to pick a daily goal during onboarding so that my habit target is set from the start. | P0 |
| US-PLT-04 | As a guest, I want to be prompted to save my progress after my first lesson so that I don't lose it. | P0 |
| US-PLT-05 | As a guest, I want my XP, streak and completed lessons moved to my new account when I sign up so that I keep my progress. | P0 |
| US-PLT-06 | As a learner, I want to sign up and log in with email and password so that my progress is saved across devices. | P0 |
| US-PLT-07 | As a learner, I want to sign in with Google so that I don't need another password. | P0 |
| US-PLT-08 | As a learner, I want to reset my password by email so that I can get back into my account. | P1 |
| US-PLT-09 | As a signed-in learner, I want to log out so that I can protect my account on a shared device. | P0 |
| US-PLT-10 | As a learner, I want a profile showing my total XP, current streak, longest streak and lessons completed so that I can see my overall progress. | P0 |
| US-PLT-11 | As a learner, I want to change my display name and avatar so that my profile feels like mine. | P2 |
| US-PLT-12 | As a learner, I want to change my daily goal and sound settings so that the app fits my routine. | P1 |
| US-PLT-13 | As a learner, I want to install the app on my phone's home screen so that I can open it like a native app. | P0 |
| US-PLT-14 | As a learner, I want lessons I've already loaded to work offline so that I can learn without a connection. | P0 |
| US-PLT-15 | As a learner, I want lessons I finish offline to sync automatically when I'm back online so that I never lose XP or streak days. | P0 |
| US-PLT-16 | As a learner, I want to see when I'm offline so that I understand why some features are unavailable. | P1 |
| US-PLT-17 | As a learner, I want the app to work well on a small phone screen (375 px) so that I can use it comfortably anywhere. | P0 |
| US-PLT-18 | As a learner sensitive to motion, I want animations reduced when my system asks for it so that the app is comfortable to use. | P1 |

## Content

| ID | Story | Priority |
|---|---|---|
| US-CON-01 | As a beginner, I want Unit 1 to teach everyday basics (greetings, introductions, food, numbers, places) so that I can use them right away. | P0 |
| US-CON-02 | As a learner, I want every listening exercise to have clear native-quality audio so that I learn correct pronunciation. | P0 |
| US-CON-03 | As a learner, I want sentences to accept reasonable alternative translations so that I'm not marked wrong for a valid answer. | P1 |
