// Mathematics (Year 2) · Chapter 5 · Money and problem solving (AC9M2N06)
// lv: 1 easy · 2 medium · 3 hard    a: index of correct option (0–3)    ex: short friendly explanation
// All mathematics in LaTeX between $…$ (KaTeX). Plain-text dollar signs are written \$.
export default {
  id: "enmathy2-05",
  subject: "enmathy2",
  title: "Money and problem solving",
  quizSize: 15,
  questions: [
    // ---- Australian coins and notes ----
    { lv: 1, q: "Which of these is a real Australian coin?", o: ["a \\$3 coin", "a 20c coin", "a \\$7 coin", "a 2c coin"], a: 1,
      ex: "Australian coins are 5c, 10c, 20c, 50c, \\$1 and \\$2. The 20c coin is real. There is no \\$3, \\$7 or 2c coin today." },
    { lv: 1, q: "Which coin is worth the most?", o: ["5c", "10c", "20c", "50c"], a: 3,
      ex: "50 cents is more than 20, 10 or 5 cents. The 50c coin is worth the most." },
    { lv: 1, q: "How many cents are in \\$1?", o: ["10 cents", "50 cents", "100 cents", "1000 cents"], a: 2,
      ex: "One dollar is the same as $100$ cents. We write \\$1 or 100c." },
    { lv: 1, q: "Which Australian note is worth the most?", o: ["\\$5", "\\$50", "\\$20", "\\$10"], a: 1,
      ex: "Put the notes in order: \\$5, \\$10, \\$20, \\$50. The \\$50 note is worth the most of these." },
    { lv: 1, q: "Two 50c coins are worth the same as which coin?", o: ["a 20c coin", "a \\$2 coin", "a \\$1 coin", "a 10c coin"], a: 2,
      ex: "$50 + 50 = 100$ cents, and $100$ cents is \\$1. So two 50c coins make a \\$1 coin." },
    { lv: 1, q: "Which is worth more, a \\$2 coin or a \\$5 note?", o: ["the \\$5 note", "the \\$2 coin", "they are worth the same", "a note is never worth more than a coin"], a: 0,
      ex: "$5$ is bigger than $2$, so the \\$5 note is worth more. Size does not matter, only the number on it." },
    { lv: 1, q: "How many 10c coins make \\$1?", o: ["5", "20", "100", "10"], a: 3,
      ex: "Count by tens: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100. That is $10$ coins to make $100$ cents." },
    { lv: 1, q: "Which of these is an Australian note?", o: ["a \\$2 note", "a \\$25 note", "a \\$1 note", "a \\$20 note"], a: 3,
      ex: "Australian notes are \\$5, \\$10, \\$20, \\$50 and \\$100. \\$1 and \\$2 are coins, and there is no \\$25 note." },

    // ---- Counting a collection of coins ----
    { lv: 1, q: "Ella has a \\$2 coin and a \\$1 coin. How much money does she have?", o: ["\\$3", "\\$1", "\\$2", "\\$4"], a: 0,
      ex: "$2 + 1 = 3$. Ella has \\$3." },
    { lv: 1, q: "Tom has a 20c coin, another 20c coin and a 10c coin. How much is that?", o: ["40c", "30c", "60c", "50c"], a: 3,
      ex: "$20 + 20 = 40$, then $40 + 10 = 50$. Tom has 50c." },
    { lv: 1, q: "Noah has four 5c coins. How much money is that?", o: ["20c", "4c", "15c", "25c"], a: 0,
      ex: "Count by fives: 5, 10, 15, 20. Four 5c coins make 20c." },
    { lv: 2, q: "Lily has these coins: 50c, 20c, 20c and 5c. How much does she have?", o: ["85c", "90c", "95c", "\\$1"], a: 2,
      ex: "Start with the biggest coin: $50 + 20 = 70$, $70 + 20 = 90$, $90 + 5 = 95$. Lily has 95c." },
    { lv: 2, q: "Zac has two \\$2 coins and two 50c coins. How much money does he have?", o: ["\\$4.50", "\\$5.50", "\\$4", "\\$5"], a: 3,
      ex: "Two \\$2 coins make \\$4. Two 50c coins make \\$1. $4 + 1 = 5$, so Zac has \\$5." },
    { lv: 2, q: "Ava has a \\$5 note, a \\$2 coin, a 20c coin and a 10c coin. How much is that altogether?", o: ["\\$7.30", "\\$7.20", "\\$8.30", "\\$7.03"], a: 0,
      ex: "Dollars first: $5 + 2 = 7$. Cents next: $20 + 10 = 30$. Together that is \\$7.30." },
    { lv: 3, q: "Jack has three 20c coins and four 10c coins. How much money does he have?", o: ["70c", "\\$1", "\\$1.20", "90c"], a: 1,
      ex: "Three 20c coins: $20 + 20 + 20 = 60$. Four 10c coins: $10 + 10 + 10 + 10 = 40$. $60 + 40 = 100$ cents, which is \\$1." },

    // ---- Making an amount in different ways ----
    { lv: 2, q: "Which group of coins makes exactly 50c?", o: ["20c, 20c, 5c", "10c, 10c, 10c, 10c", "20c, 20c, 20c", "20c, 10c, 10c, 10c"], a: 3,
      ex: "$20 + 10 + 10 + 10 = 50$. The others make 45c, 40c and 60c." },
    { lv: 2, q: "Which group of coins makes exactly \\$1?", o: ["50c, 20c, 20c, 10c", "50c, 20c, 20c", "50c, 50c, 10c", "20c, 20c, 20c, 20c"], a: 0,
      ex: "$50 + 20 + 20 + 10 = 100$ cents, and that is \\$1. The others make 90c, \\$1.10 and 80c." },
    { lv: 2, q: "Mia makes 30c with 3 coins that are all the same. Which coins does she use?", o: ["10c, 10c, 10c", "20c, 20c, 20c", "5c, 5c, 5c", "50c, 50c, 50c"], a: 0,
      ex: "Three 10c coins: $10 + 10 + 10 = 30$. Three 20c coins would be 60c and three 5c coins only 15c." },
    { lv: 3, q: "Which group of coins does NOT make \\$2?", o: ["\\$1, 50c, 50c", "\\$1, \\$1", "50c, 50c, 50c, 20c", "50c, 50c, 50c, 50c"], a: 2,
      ex: "$50 + 50 + 50 + 20 = 170$ cents, which is \\$1.70, not \\$2. Each of the other groups adds up to exactly \\$2." },
    { lv: 3, q: "Which of these is another way to make the same amount as a \\$2 coin, a 50c coin and a 20c coin?", o: ["\\$1, \\$1, 50c, 10c, 10c", "\\$2, 20c, 20c, 20c", "\\$1, 50c, 50c, 50c", "\\$2, 50c, 50c"], a: 0,
      ex: "\\$2 + 50c + 20c = \\$2.70. Check: $1 + 1 = 2$ dollars and $50 + 10 + 10 = 70$ cents, so the first group is also \\$2.70. The others make \\$2.60, \\$2.50 and \\$3." },

    // ---- Fewest coins ----
    { lv: 2, q: "What is the fewest number of coins you need to make 60c?", o: ["1", "2", "3", "6"], a: 1,
      ex: "Use the biggest coin first: 50c, then 10c more. $50 + 10 = 60$. That is just 2 coins." },
    { lv: 3, q: "What is the fewest number of coins you need to make \\$3.50?", o: ["7", "4", "3", "2"], a: 2,
      ex: "Use big coins: \\$2, then \\$1, then 50c. $2 + 1 = 3$ dollars and 50c more makes \\$3.50. That is 3 coins. No two coins can make \\$3.50." },
    { lv: 3, q: "What is the fewest number of coins you need to make 85c?", o: ["3", "4", "5", "6"], a: 1,
      ex: "Biggest coin first: 50c, then 20c (70c), then 10c (80c), then 5c (85c). That is 4 coins. You need the 5c coin because 85 does not end in 0." },

    // ---- Adding prices ----
    { lv: 1, q: "An apple costs \\$1 and a banana costs \\$2. How much do they cost together?", o: ["\\$1", "\\$2", "\\$4", "\\$3"], a: 3,
      ex: "$1 + 2 = 3$. Together they cost \\$3." },
    { lv: 2, q: "A sausage roll costs \\$2.50 and a juice costs \\$1.50. How much is that altogether?", o: ["\\$3.50", "\\$4", "\\$3", "\\$4.50"], a: 1,
      ex: "Dollars: $2 + 1 = 3$. Cents: $50 + 50 = 100$, which is one more dollar. $3 + 1 = 4$, so it is \\$4." },
    { lv: 2, q: "A pencil costs \\$3.20 and a rubber costs \\$1.50. What is the total cost?", o: ["\\$4.70", "\\$4.20", "\\$5.70", "\\$4.50"], a: 0,
      ex: "Dollars: $3 + 1 = 4$. Cents: $20 + 50 = 70$. The total is \\$4.70." },
    { lv: 2, q: "Two ice creams cost \\$4.50 each. How much do both cost?", o: ["\\$8", "\\$8.50", "\\$9", "\\$9.50"], a: 2,
      ex: "Double \\$4.50: $4 + 4 = 8$ dollars and $50 + 50 = 100$ cents, which is \\$1. $8 + 1 = 9$, so \\$9." },
    { lv: 3, q: "At the canteen a pie costs \\$3.50, a drink costs \\$2.50 and a lolly costs 50c. How much do all three cost?", o: ["\\$6", "\\$6.50", "\\$7", "\\$5.50"], a: 1,
      ex: "First $3.50 + 2.50 = 6$ dollars. Then add the 50c lolly: \\$6.50." },

    // ---- Change ----
    { lv: 1, q: "A toy costs \\$3. You pay with a \\$5 note. How much change do you get?", o: ["\\$2", "\\$3", "\\$1", "\\$8"], a: 0,
      ex: "Count on from 3 up to 5: 4, 5. That is $2$ more, so the change is \\$2." },
    { lv: 2, q: "A book costs \\$6.50. You pay with a \\$10 note. How much change do you get?", o: ["\\$4.50", "\\$3.50", "\\$4", "\\$3"], a: 1,
      ex: "From \\$6.50, add 50c to get \\$7, then add \\$3 to get \\$10. $0.50 + 3 = 3.50$, so the change is \\$3.50." },
    { lv: 2, q: "A drink costs \\$4.20. You pay with a \\$5 note. How much change do you get?", o: ["\\$1.20", "20c", "\\$1.80", "80c"], a: 3,
      ex: "Count on from \\$4.20: 10c more is \\$4.30, and keep going to \\$5. $4.20 + 0.80 = 5$. The change is 80c." },
    { lv: 2, q: "A game costs \\$12. You pay with a \\$20 note. How much change do you get?", o: ["\\$12", "\\$32", "\\$8", "\\$18"], a: 2,
      ex: "$20 - 12 = 8$. The change is \\$8." },
    { lv: 3, q: "Ruby buys a hat for \\$3 and a ball for \\$5. She pays with a \\$20 note. How much change does she get?", o: ["\\$8", "\\$12", "\\$15", "\\$17"], a: 1,
      ex: "First find the total: $3 + 5 = 8$. Then take it from \\$20: $20 - 8 = 12$. Ruby gets \\$12 change." },

    // ---- Comparing prices ----
    { lv: 1, q: "Which toy is the cheapest?", o: ["a car for \\$2.50", "a ball for \\$3", "a yo-yo for \\$1.80", "a kite for \\$2"], a: 2,
      ex: "\\$1.80 is less than \\$2, \\$2.50 and \\$3. The yo-yo is the cheapest." },
    { lv: 2, q: "An apple costs \\$1.20 and a pear costs \\$1.50. How much more does the pear cost?", o: ["30c", "20c", "70c", "\\$2.70"], a: 0,
      ex: "Count on from \\$1.20 to \\$1.50: $1.20 + 0.30 = 1.50$. The pear costs 30c more." },
    { lv: 2, q: "Which of these costs the most?", o: ["\\$9.50", "\\$8.90", "\\$10", "\\$9.90"], a: 2,
      ex: "\\$10 is more than \\$9.90, \\$9.50 and \\$8.90. Look at the dollars first: 10 dollars beats 9 dollars or 8 dollars." },
    { lv: 3, q: "A big bag of chips costs \\$4 and a small bag costs \\$2.50. Jen buys the small bag. How much does she save?", o: ["\\$1.50", "\\$2.50", "\\$6.50", "\\$2"], a: 0,
      ex: "Find the difference: from \\$2.50, add 50c to get \\$3, then \\$1 to get \\$4. $0.50 + 1 = 1.50$. Jen saves \\$1.50." },

    // ---- Two-step shopping word problems ----
    { lv: 3, q: "Ben has \\$10. He buys a book for \\$6 and a pencil for \\$2. How much money does he have left?", o: ["\\$4", "\\$8", "\\$2", "\\$18"], a: 2,
      ex: "He spends $6 + 2 = 8$ dollars. Then $10 - 8 = 2$. Ben has \\$2 left." },
    { lv: 3, q: "Sam has \\$4.50. His mum gives him \\$2.50. Then he spends \\$5 on lunch. How much does he have now?", o: ["\\$7", "\\$2", "\\$3", "\\$1.50"], a: 1,
      ex: "First $4.50 + 2.50 = 7$ dollars. Then $7 - 5 = 2$. Sam has \\$2 now." },
    { lv: 2, q: "Chloe has \\$8. She spends \\$5 at the shop. Then she finds a \\$2 coin. How much does she have now?", o: ["\\$3", "\\$1", "\\$15", "\\$5"], a: 3,
      ex: "$8 - 5 = 3$, then $3 + 2 = 5$. Chloe has \\$5." },

    // ---- Groups of the same price (additive and multiplicative thinking) ----
    { lv: 2, q: "Ice creams cost \\$2 each. How much do 3 ice creams cost?", o: ["\\$5", "\\$6", "\\$3", "\\$8"], a: 1,
      ex: "$2 + 2 + 2 = 6$, or $3 \\times 2 = 6$. Three ice creams cost \\$6." },
    { lv: 2, q: "A juice costs \\$2. How many juices can you buy with \\$10?", o: ["4", "8", "5", "12"], a: 2,
      ex: "Count by twos up to 10: 2, 4, 6, 8, 10. That is 5 juices. $10 \\div 2 = 5$." },
    { lv: 2, q: "A pencil costs \\$1.50. How much do 2 pencils cost?", o: ["\\$2.50", "\\$3.50", "\\$2", "\\$3"], a: 3,
      ex: "Double \\$1.50: $1 + 1 = 2$ dollars and $50 + 50 = 100$ cents, which is \\$1. So 2 pencils cost \\$3." },
    { lv: 3, q: "Stickers cost 20c each. Max buys 5 stickers and pays with a \\$2 coin. How much change does he get?", o: ["\\$1.80", "\\$1", "80c", "\\$1.20"], a: 1,
      ex: "Count by 20s: 20, 40, 60, 80, 100. Five stickers cost 100c, which is \\$1. $2 - 1 = 1$, so Max gets \\$1 change." },
    { lv: 3, q: "Lollies cost 50c each. Ivy has \\$2 and buys as many lollies as she can. How many lollies does she buy?", o: ["2", "3", "5", "4"], a: 3,
      ex: "Count by 50s: 50, 100, 150, 200. Four lollies cost 200c, which is \\$2. Ivy buys 4 lollies with no money left over." },
  ],
};
