// modify space if time

"use client";

import React, { useState } from "react";

const Page = () => {
  const paragraph1 = `
    A few weeks ago, Franky Roberts on our Talent Team shared a quote from Roger Federers commencement speech at Dartmouth. Federer was born on August 8, 1981, in Basel, Switzerland, and is regarded as one of the greatest tennis players ever. He started young and won the Wimbledon boys’ singles and doubles in 1998. Federer would win 20 Grand Slam singles, including eight from Wimbledon (a record for men), six from Australia, five from the US, and one from France. He won Gold in doubles at the 2008 Beijing Olympics and Silver in singles at the 2012 London Olympics. He held the World #1 ranking for a record total of 310 weeks. He is known for his versatile and fluid game and outstanding sportsmanship on and off the court
  `;

  const paragraph2 = `
    He announced his retirement from the sport in September 2022 and now has the freedom to give commencement speeches rather than train for his next match. He had three lessons: (1) effortless is a myth, (2) it’s only a point, and (3) life is bigger than the court
  `;

  const paragraph3 = `
    Last week, we explored determination, grit, and perseverance, i.e., “effortless is a myth”. This week, let’s examine “it’s only a point,” and return to Federer’s quote that Franky shared: “Perfection is impossible". In the 1526 singles matches I played in my career, I won almost 80% of those matches. Now, I have a question for you. What percentage of points do you think I won in those matches? Only 54%. In other words, even top-ranked tennis players win barely more than half of the points they play. When you lose every second point on average, you learn not to dwell on every shot. You teach yourself to think…it’s only a point”
  `;

  const paragraph4 = `
    Other great players, such as Rafael Nadal, Novak Djokovic, Roger Federer, Pete Sampras, Andre Agassi, and Andy Roddick, have point-win rates that range from 55% to 53%. Below that, who will remember or care? It seems surprising that such a slight edge differentiates world champions from irrelevance
  `;

  const [highlightedSentence, setHighlightedSentence] = useState<string | null>(
    null
  );

  const handleMouseEnter = (sentence: string) => {
    setHighlightedSentence(sentence);
  };

  const handleMouseLeave = () => {
    setHighlightedSentence(null);
  };

  const handleClick = async (sentence: string) => {
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: sentence }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audio");
      }

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const renderParagraph = (text: string) => {
    const sentences = text.split(". ").map((sentence, sIndex) => (
      <span
        key={sIndex}
        style={{
          backgroundColor:
            highlightedSentence === sentence ? "#FEF3C7" : "transparent",
          cursor: "pointer",
        }}
        onMouseEnter={() => handleMouseEnter(sentence)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(sentence)}
      >
        {sentence.trim() && `${sentence.trim()}. `}
      </span>
    ));
    return sentences;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>It&rsquo;s only a point</h1>
      <div className="flex flex-row justify-center items-center gap-x-6 mb-8 text-sm">
        <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
          text by Alfred Lin
        </div>
        <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
          audio via ElevenLabs
        </div>
      </div>
      <div style={styles.body}>
        <p style={styles.paragraph}>{renderParagraph(paragraph1)}</p>
        <p style={styles.paragraph}>{renderParagraph(paragraph2)}</p>
        <p style={styles.paragraph}>{renderParagraph(paragraph3)}</p>
        <p style={styles.paragraph}>{renderParagraph(paragraph4)}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    padding: "0 20px",
    textAlign: "center" as const,
    backgroundColor: "#f7fafc", // gray-50
    color: "#171717", // gray-950
  },
  header: {
    fontSize: "1.5rem",
    marginBottom: "2rem",
    marginTop: "2rem",
  },
  body: {
    fontSize: "0.9rem",
    lineHeight: "1.6",
    maxWidth: "800px",
    textAlign: "left" as const,
  },
  paragraph: {
    marginBottom: "1rem",
  },
};

export default Page;
