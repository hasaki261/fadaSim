> This simulation code is a resource that helps with the math behind [this document](https://fluffy-iberis-173.notion.site/Estimativa-de-rolls-383b263b92b5805ca9b1ec00e359c1e1).

The code generates random substats and upgrade configurations based on game (Zenless Zone Zero) mechanics, and then analyzes them.

**Chance.js**, **Piscina.js** (and **d3-array**) were used to keep the code cleaner, but you can achieve the same result natively using `Math.random()` function and Workers Threads module. **Inquire.js** is also used for the CLI.

# Usage:
This code has 2 main functions called TaskA and TaskB, they do different types of simulations:
### TaskA
TaskA simulates a bunch of disks and analyzes how many rolls they have, so, basically you can estimate the individual probability of dropping a disk for each roll count.
This can be used to answer questions like: "If I farm 1000 disks, how many of them will have 5 rolls?" or "What is the chance of dropping a disk with 5 rolls in one disk farmed".
### TaskB
TaskB simulates a minor amount of disks, but for a bunch of "players", analyzes if the player has at least one disk with a specific amount of rolls, and shows in the console the amount of players that have at least one disk with the specific amount of rolls
Also, TaskB can be used to answer more complex questions: "If 1000 players farmed 100 disks each, how many of them will have one disk with 5 rolls?" or "If I farm 1000 disks, what is my chance of dropping one with 5 rolls?".
#### TaskB - Max
TaskB max is a submode of TaskB, just changing what the code reads in the result of the simulations: instead of reading how many players have one specific amount of rolls, this mode reads how many of the players have a max of a specific amount of rolls.
So, this mode can be used to answer questions like this: "If 1000 players farmed 10 disks each, how many of them will have their best disk (out of the 10) be one with 5 rolls?" or "If I farm 10 disks, what is the chance of my best disk to be one with 5 rolls?"

---

You can try this code by cloning the repo (`git clone https://github.com/hasaki261/fadaSim.git && cd fadaSim`), installing the dependencies (`npm install`), and using the CLI (`node main`) to configure.