const dungeons = [
  {
    name: "Pixel Dungeon",
    rating: 4.5,
    plays: 100,
    image: "assets/img/dungeons/1.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Old School Dungeon",
    rating: 3.5,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/2.png",
    difficulty: "Hard",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 2",
    rating: 3.5,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/3.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Alien Dungeon",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/4.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Puzzle Dungeon",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/5.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Cave Dungeon",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/6.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Casual Dungeon",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/7.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Modern Dungeon",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/8.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 3",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/3.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 3",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/4.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 3",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/1.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 3",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/2.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 3",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/3.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 3",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/4.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 3",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/1.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Hard Dungeon",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/2.png",
    difficulty: "Hard",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 3",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/3.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 3",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/4.png",
    difficulty: "Medium",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 3",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/5.png",
    difficulty: "Easy",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  {
    name: "Dungeon 3",
    rating: 3.9,
    plays: Math.floor(Math.random() * 1000),
    image: "assets/img/dungeons/6.png",
    difficulty: "Medium",
    address:
      "0x" +
      Math.floor(Math.random() * 1e16)
        .toString(16)
        .padStart(16, "0"),
  },
  // Add more dungeons as needed
];
