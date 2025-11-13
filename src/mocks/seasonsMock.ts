// src/mocks/seasonsMock.ts

import type { Season } from "@/components/movies/SeasonsAccordion";

export const seasonsMock: Season[] = [
  /* ───────── Season 01 ───────── */
  {
    id: "season-01",
    name: "Season 01",
    episodes: [
      {
        id: "s01e01",
        title: "Chapter One : The Vanishing of Will Byers",
        overview:
          "On his way home from a friend's house, young Will sees something terrifying. Nearby, a sinister secret lurks in the depths of a government lab.",
        runtime: "49 min",
        still:
          "https://image.tmdb.org/t/p/w300/mj2x3ybtzY5PzXy7kwhDMu0cdMk.jpg",
      },
      {
        id: "s01e02",
        title: "Chapter Two : The Weirdo on Maple Street",
        overview:
          "Lucas, Mike and Dustin try to talk to the girl they found in the woods. Hopper questions an anxious Joyce about an unsettling phone call.",
        runtime: "56 min",
        still:
          "https://image.tmdb.org/t/p/w300/6g9dK6JDaE0bNvWwWcHIwM9Sprb.jpg",
      },
      {
        id: "s01e03",
        title: "Chapter Three : Holly, Jolly",
        overview:
          "An increasingly concerned Nancy looks for Barb and finds out what Jonathan's been up to. Joyce is convinced Will is trying to talk to her.",
        runtime: "52 min",
        still:
          "https://image.tmdb.org/t/p/w300/eVY3BvMCh8H4lRWzdu0bOED9RiV.jpg",
      },
      {
        id: "s01e04",
        title: "Chapter Four : The Body",
        overview:
          "Refusing to believe Will is dead, Joyce tries to connect with her son. The boys give Eleven a makeover.",
        runtime: "51 min",
        still:
          "https://image.tmdb.org/t/p/w300/7VfHx9AQo4SeUJpDG1SZXy7V7Cs.jpg",
      },
      {
        id: "s01e05",
        title: "Chapter Five : The Flea and the Acrobat",
        overview:
          "Hopper breaks into the lab while Nancy and Jonathan confront the force that took Will. The boys ask Mr. Clarke how to travel to another dimension.",
        runtime: "53 min",
        still:
          "https://image.tmdb.org/t/p/w300/p4ViUnhYQn1ko3eSxGX2t7mioWm.jpg",
      },
    ],
  },

  /* ───────── Season 02 ───────── */
  {
    id: "season-02",
    name: "Season 02",
    episodes: [
      {
        id: "s02e01",
        title: "MADMAX",
        overview:
          "As the town prepares for Halloween, a high-scoring rival shakes things up at the arcade, and a skeptical Hopper inspects a field of rotting pumpkins.",
        runtime: "48 min",
        still:
          "https://image.tmdb.org/t/p/w300/erE9V1cAf3Wn7gDxkKyYtJ3n8Zk.jpg",
      },
      {
        id: "s02e02",
        title: "Trick or Treat, Freak",
        overview:
          "After Will sees something terrible on trick-or-treat night, Mike wonders whether Eleven is still out there. Nancy wrestles with the truth about Barb.",
        runtime: "56 min",
        still:
          "https://image.tmdb.org/t/p/w300/x2FqGCC5L5MdkXYkwBjN3wSdTDk.jpg",
      },
      {
        id: "s02e03",
        title: "The Pollywog",
        overview:
          "Dustin adopts a strange new pet, and Eleven grows increasingly impatient. A well-meaning Bob urges Will to stand up to his fears.",
        runtime: "52 min",
        still:
          "https://image.tmdb.org/t/p/w300/7wPhgVRwA5kXIw9CErBpT6pgXsV.jpg",
      },
      {
        id: "s02e04",
        title: "Will the Wise",
        overview:
          "An ailing Will opens up to Joyce—with disturbing results. While Hopper... digs, Eleven searches for someone from her past.",
        runtime: "46 min",
        still:
          "https://image.tmdb.org/t/p/w300/6eHxu0pccKIvYUZNVc7GkPrahcp.jpg",
      },
      {
        id: "s02e05",
        title: "Dig Dug",
        overview:
          "Nancy and Jonathan swap conspiracy theories with a new ally as Eleven searches for someone from her past.",
        runtime: "54 min",
        still:
          "https://image.tmdb.org/t/p/w300/bu0pMIHBYT4GhRiz2QGXct2xmNL.jpg",
      },
    ],
  },
  /* … thêm Season 03 nếu cần … */
];
