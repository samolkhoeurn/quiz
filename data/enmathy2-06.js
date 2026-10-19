// Mathematics (Year 2) · Chapter 6 · Patterns and number sentences (AC9M2A01, AC9M2N04)
// lv: 1 easy · 2 medium · 3 hard    a: index of correct option (0–3)    ex: short friendly explanation
// All mathematics in LaTeX between $…$ (KaTeX). Plain-text dollar signs are written \$.
export default {
  id: "enmathy2-06",
  subject: "enmathy2",
  title: "Patterns and number sentences",
  quizSize: 15,
  questions: [
    // ---- Growing patterns: what comes next and the rule ----
    { lv: 1, q: "What comes next in this pattern? $3, 6, 9, 12, \\ldots$", o: ["14", "16", "18", "15"], a: 3,
      ex: "The numbers go up by $3$ each time. $12 + 3 = 15$." },
    { lv: 1, q: "What comes next in this pattern? $2, 4, 6, 8, \\ldots$", o: ["9", "12", "11", "10"], a: 3,
      ex: "This is counting by twos. After $8$ comes $10$." },
    { lv: 1, q: "What comes next in this pattern? $5, 10, 15, 20, \\ldots$", o: ["30", "21", "22", "25"], a: 3,
      ex: "This is counting by fives. $20 + 5 = 25$." },
    { lv: 1, q: "What comes next in this pattern? $7, 10, 13, 16, \\ldots$", o: ["18", "19", "20", "17"], a: 1,
      ex: "Each number is $3$ more than the one before: $7 + 3 = 10$, $10 + 3 = 13$. So $16 + 3 = 19$." },
    { lv: 2, q: "What comes next in this pattern? $4, 8, 12, 16, 20, \\ldots$", o: ["22", "25", "24", "28"], a: 2,
      ex: "Find the rule first: $8 - 4 = 4$, so add $4$ each time. $20 + 4 = 24$." },
    { lv: 2, q: "What is the rule for this pattern? $3, 6, 9, 12$", o: ["Add 3 each time", "Add 2 each time", "Take away 3 each time", "Double each time"], a: 0,
      ex: "$3 + 3 = 6$, $6 + 3 = 9$, $9 + 3 = 12$. The rule is add $3$. The numbers get bigger, so it is not take away." },
    { lv: 2, q: "What is the rule for this pattern? $12, 14, 16, 18$", o: ["Add 1 each time", "Take away 2 each time", "Add 2 each time", "Add 4 each time"], a: 2,
      ex: "$14 - 12 = 2$ and $16 - 14 = 2$. Each number is $2$ more than the one before." },
    { lv: 3, q: "A pattern starts $3, 6, 9, 12, \\ldots$ and keeps going by the same rule. What is the 7th number?", o: ["18", "24", "21", "20"], a: 2,
      ex: "Keep adding $3$: $3, 6, 9, 12, 15, 18, 21$. Count them: the 7th number is $21$." },
    { lv: 3, q: "Start at $1$ and add $5$ each time: $1, 6, 11, 16, \\ldots$ What are the next two numbers?", o: ["20 and 25", "21 and 26", "21 and 25", "22 and 27"], a: 1,
      ex: "$16 + 5 = 21$ and $21 + 5 = 26$. All the numbers in this pattern end in $1$ or $6$." },

    // ---- Shrinking patterns ----
    { lv: 1, q: "What comes next in this pattern? $50, 45, 40, 35, \\ldots$", o: ["25", "34", "30", "40"], a: 2,
      ex: "The numbers go down by $5$ each time. $35 - 5 = 30$." },
    { lv: 2, q: "What comes next in this pattern? $100, 90, 80, 70, \\ldots$", o: ["50", "65", "69", "60"], a: 3,
      ex: "This is counting back by tens. $70 - 10 = 60$." },
    { lv: 2, q: "What is the rule for this pattern? $30, 27, 24, 21$", o: ["Add 3 each time", "Take away 3 each time", "Take away 4 each time", "Take away 2 each time"], a: 1,
      ex: "The numbers get smaller, so the rule is take away. $30 - 27 = 3$, so take away $3$ each time." },
    { lv: 2, q: "A pattern goes $40, 35, 30, 25, \\ldots$ and keeps going. Which number will NOT be in the pattern?", o: ["20", "15", "12", "5"], a: 2,
      ex: "Counting back by fives from $40$ gives $20, 15, 10, 5, 0$. Every number ends in $0$ or $5$, so $12$ is not in the pattern." },

    // ---- Missing number in the middle ----
    { lv: 1, q: "Which number is missing? $2, 4, \\square, 8, 10$", o: ["5", "7", "6", "9"], a: 2,
      ex: "Counting by twos: $2, 4, 6, 8, 10$. The missing number is $6$." },
    { lv: 1, q: "Which number is missing? $15, 20, \\square, 30, 35$", o: ["24", "25", "22", "26"], a: 1,
      ex: "Counting by fives: $20 + 5 = 25$. Check: $25 + 5 = 30$. Yes!" },
    { lv: 2, q: "Which number is missing? $60, \\square, 40, 30, 20$", o: ["50", "55", "45", "59"], a: 0,
      ex: "The numbers go down by $10$: $60 - 10 = 50$. Check: $50 - 10 = 40$." },
    { lv: 2, q: "Which number is missing? $10, 13, \\square, 19, 22$", o: ["15", "17", "14", "16"], a: 3,
      ex: "The rule is add $3$: $10 + 3 = 13$. So the missing number is $13 + 3 = 16$. Check: $16 + 3 = 19$." },
    { lv: 3, q: "Two numbers are missing: $3, \\square, 9, \\square, 15$. What are they?", o: ["6 and 12", "5 and 11", "6 and 11", "4 and 12"], a: 0,
      ex: "From $3$ to $9$ is $6$, which is two jumps, so each jump is $3$. The pattern is $3, 6, 9, 12, 15$." },

    // ---- Patterns with shapes, colours and actions ----
    { lv: 1, q: "A pattern of beads goes: red, blue, blue, red, blue, blue, red, ... What colour is the next bead?", o: ["red", "blue", "green", "yellow"], a: 1,
      ex: "The part that repeats is red, blue, blue. After red comes blue." },
    { lv: 1, q: "A pattern goes: circle, square, circle, square, ... What shape comes next?", o: ["square", "triangle", "star", "circle"], a: 3,
      ex: "The pattern swaps circle and square. After square comes circle." },
    { lv: 2, q: "A pattern goes: star, star, moon, star, star, moon, star, ... What are the next two shapes?", o: ["star, moon", "moon, star", "star, star", "moon, moon"], a: 0,
      ex: "The repeating part is star, star, moon. We have one star, so next comes star and then moon." },
    { lv: 2, q: "Zoe claps, claps, then stamps her foot, and keeps repeating this. What is her 6th action?", o: ["clap", "stamp", "jump", "clap and stamp together"], a: 1,
      ex: "Count the actions: 1 clap, 2 clap, 3 stamp, 4 clap, 5 clap, 6 stamp. The 6th action is a stamp." },
    { lv: 2, q: "A tower pattern uses $1$ block, then $3$ blocks, then $5$ blocks. How many blocks are in the next tower?", o: ["6", "7", "8", "9"], a: 1,
      ex: "Each tower has $2$ more blocks than the one before: $1, 3, 5$. So the next tower has $5 + 2 = 7$ blocks." },
    { lv: 3, q: "A fruit pattern goes: apple, pear, pear, apple, pear, pear, ... and keeps going. What is the 10th fruit?", o: ["pear", "banana", "apple", "you cannot tell"], a: 2,
      ex: "Apples are in spots 1, 4, 7, 10 (add $3$ each time). So the 10th fruit is an apple." },

    // ---- Odd and even numbers ----
    { lv: 1, q: "Which number is even?", o: ["7", "9", "15", "12"], a: 3,
      ex: "Even numbers can be made into pairs with none left over. $12$ is $6$ pairs. Even numbers end in 0, 2, 4, 6 or 8." },
    { lv: 1, q: "Which number is odd?", o: ["10", "14", "20", "17"], a: 3,
      ex: "$17$ ends in $7$. Odd numbers end in 1, 3, 5, 7 or 9. If you make pairs from 17 things, one is left over." },
    { lv: 1, q: "Even numbers always end in which digits?", o: ["0, 2, 4, 6 or 8", "1, 3, 5, 7 or 9", "only 0", "only 2"], a: 0,
      ex: "Look at the ones digit. Even numbers end in 0, 2, 4, 6 or 8, like $14$, $20$ and $38$." },
    { lv: 2, q: "There are $24$ children. They line up in pairs. Will anyone be left without a partner?", o: ["Yes, one child is left over", "No, because 24 is even", "Yes, two children are left over", "No, because 24 is odd"], a: 1,
      ex: "$24$ ends in $4$, so it is even. Even numbers make pairs with no one left over: $24$ children make $12$ pairs." },
    { lv: 3, q: "Jo adds two odd numbers, like $3 + 5$ or $7 + 9$. Her answer will always be ...", o: ["an even number", "an odd number", "a number bigger than 20", "a number less than 10"], a: 0,
      ex: "Try it: $3 + 5 = 8$ and $7 + 9 = 16$. Each odd number has one left over, and the two left-overs make a new pair. So odd plus odd is always even." },
    { lv: 3, q: "Which number is even and is between $51$ and $55$ and is more than $52$?", o: ["52", "53", "54", "56"], a: 2,
      ex: "The numbers between $51$ and $55$ are $52, 53, 54$. More than $52$ leaves $53$ and $54$. The even one is $54$." },

    // ---- Skip-counting patterns on a hundred chart ----
    { lv: 1, q: "On a hundred chart, Max colours in $10, 20, 30, 40, \\ldots$ all the way down. Which number is coloured?", o: ["45", "60", "55", "61"], a: 1,
      ex: "Counting by tens from $10$ gives numbers that end in $0$. $60$ ends in $0$, so it is coloured." },
    { lv: 2, q: "On a hundred chart, Ava starts at $5$ and counts by fives, colouring each number. Which number is coloured?", o: ["23", "35", "42", "51"], a: 1,
      ex: "Counting by fives from $5$: $5, 10, 15, 20, 25, 30, 35, \\ldots$ These numbers all end in $5$ or $0$. So $35$ is coloured." },
    { lv: 3, q: "Liam counts by twos from $2$: $2, 4, 6, 8, \\ldots$ all the way to $100$. Which number does he NOT say?", o: ["53", "48", "50", "56"], a: 0,
      ex: "Counting by twos from $2$ says only even numbers. $53$ is odd, so Liam does not say it." },

    // ---- True or false number sentences ----
    { lv: 1, q: "Is this number sentence true? $8 + 5 = 13$", o: ["True", "False, it should be 12", "False, it should be 14", "False, it should be 3"], a: 0,
      ex: "Count on from $8$: 9, 10, 11, 12, 13. So $8 + 5 = 13$ is true." },
    { lv: 1, q: "Which number sentence is true?", o: ["$6 + 7 = 12$", "$9 - 4 = 6$", "$10 - 3 = 6$", "$5 + 5 = 10$"], a: 3,
      ex: "$5 + 5 = 10$ is a double, and it is true. The others are wrong: $6 + 7 = 13$, $9 - 4 = 5$ and $10 - 3 = 7$." },
    { lv: 2, q: "Which number sentence is FALSE?", o: ["$9 + 6 = 14$", "$7 + 8 = 15$", "$12 - 5 = 7$", "$20 - 10 = 10$"], a: 0,
      ex: "$9 + 6 = 15$, not $14$. Think $9 + 1 = 10$ and then $5$ more. The other three sentences are true." },
    { lv: 2, q: "Only one of these number sentences is true. Which one?", o: ["$14 - 6 = 9$", "$8 + 7 = 16$", "$18 - 9 = 9$", "$13 - 7 = 5$"], a: 2,
      ex: "$9 + 9 = 18$, so $18 - 9 = 9$ is true. The others are off by one: $14 - 6 = 8$, $8 + 7 = 15$ and $13 - 7 = 6$." },

    // ---- Balancing number sentences ----
    { lv: 2, q: "What number makes this sentence true? $7 + 5 = \\square + 4$", o: ["12", "8", "9", "16"], a: 1,
      ex: "The left side is $7 + 5 = 12$. The right side must also be $12$. $8 + 4 = 12$, so the missing number is $8$." },
    { lv: 2, q: "What number makes this sentence true? $10 + 6 = 9 + \\square$", o: ["16", "6", "7", "8"], a: 2,
      ex: "$10 + 6 = 16$. We need $9 + \\square = 16$. Count on from $9$ to $16$: that is $7$." },
    { lv: 3, q: "What number makes this sentence true? $15 - 5 = \\square + 3$", o: ["10", "13", "8", "7"], a: 3,
      ex: "The left side is $15 - 5 = 10$. So $\\square + 3 = 10$, and $7 + 3 = 10$. The missing number is $7$." },
    { lv: 3, q: "What number makes this sentence true? $\\square + 4 = 12 - 2$", o: ["6", "14", "10", "8"], a: 0,
      ex: "Work out the right side first: $12 - 2 = 10$. Then $\\square + 4 = 10$, so the missing number is $6$." },

    // ---- Writing a number sentence for a story ----
    { lv: 1, q: "Tom has 5 marbles. He gets 3 more. Which number sentence matches the story?", o: ["$5 + 3$", "$5 - 3$", "$3 - 5$", "$5 \\times 3$"], a: 0,
      ex: "Getting more means adding. The sentence is $5 + 3 = 8$." },
    { lv: 2, q: "There are 12 birds on a wire. 4 birds fly away. Which number sentence matches the story?", o: ["$12 + 4$", "$4 - 12$", "$12 - 4$", "$12 \\div 4$"], a: 2,
      ex: "Birds flying away means take away. Start with $12$ and take away $4$: $12 - 4 = 8$." },
    { lv: 3, q: "Mia had some stickers. She gave away 6 and now has 9 left. Which number sentence shows the story?", o: ["$9 - 6 = \\square$", "$\\square - 6 = 9$", "$\\square + 6 = 9$", "$6 - \\square = 9$"], a: 1,
      ex: "Mia started with a number we do not know, gave away $6$, and had $9$ left. That is $\\square - 6 = 9$. She started with $15$ stickers." },
    { lv: 3, q: "10 sweets are shared equally between 2 children. Which number sentence tells how many each child gets?", o: ["$10 - 2$", "$10 + 2$", "$10 \\times 2$", "$10 \\div 2$"], a: 3,
      ex: "Sharing equally is dividing. $10 \\div 2 = 5$, so each child gets $5$ sweets." },
  ],
};
