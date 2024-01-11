"use client";
import { useCallback, useEffect, useState } from "react";
type Position = {
  row: number;
  col: number;
};
type SnakeSegment = Position & {
  direction: string; // You might want to use a more specific type for direction, like "UP" | "DOWN" | "LEFT" | "RIGHT"
};
const ROWS = 10;
const COLS = 10;
const initialSnake = [
  { row: 0, col: 2, direction: "RIGHT" },
  { row: 0, col: 1, direction: "RIGHT" },
  { row: 0, col: 0, direction: "RIGHT" },
];

const SnakeGame = () => {
  const [snake, setSnake] = useState([
    { row: 0, col: 2, direction: "RIGHT" },
    { row: 0, col: 1, direction: "RIGHT" },
    { row: 0, col: 0, direction: "RIGHT" },
  ]);
  const generateRandomPosition = useCallback((snake: SnakeSegment[] | Position[]) => {
    let newPos: Position;
    do {
      newPos = {
        row: Math.floor(Math.random() * ROWS),
        col: Math.floor(Math.random() * COLS),
      };
    } while (
      snake.some(
        (segment) => segment.row === newPos.row && segment.col === newPos.col
      )
    );

    return newPos;
  }, []);
  const [food, setFood] = useState(generateRandomPosition(snake));
  const [direction, setDirection] = useState("RIGHT");

  const handleGameTick = useCallback(() => {
    setSnake((prevSnake) => {
      const newSnake = prevSnake.map((segment, index) => {
        const newSegment = { ...segment };
        if (index === 0) {
          switch (direction) {
            case "UP":
              newSegment.row = (newSegment.row - 1 + ROWS) % ROWS;
              break;
            case "DOWN":
              newSegment.row = (newSegment.row + 1) % ROWS;
              break;
            case "LEFT":
              newSegment.col = (newSegment.col - 1 + COLS) % COLS;
              break;
            case "RIGHT":
              newSegment.col = (newSegment.col + 1) % COLS;
              break;
            default:
              break;
          }
          newSegment.direction = direction;
        } else {
          const prevSegment = prevSnake[index - 1];
          newSegment.row = prevSegment.row;
          newSegment.col = prevSegment.col;
          newSegment.direction = prevSegment.direction;
        }
        return newSegment;
      });

      // Check for collisions with itself
      const head = newSnake[0];
      const body = newSnake.slice(1);
      if (
        body.some(
          (segment) => segment.row === head.row && segment.col === head.col
        )
      ) {
        // Collision detected, reset the game
        setSnake(initialSnake);
        setFood(generateRandomPosition(initialSnake));
        setDirection("RIGHT");
        return initialSnake;
      }
      if (head.row === food.row && head.col === food.col) {
        setFood(generateRandomPosition([...newSnake, food]));
        // Add a new segment to the snake when it collects food
        const lastSegment = newSnake[newSnake.length - 1];
        newSnake.push({ ...lastSegment });
      }

      return newSnake.length > 0 ? newSnake : prevSnake;
    });
  }, [direction, food.col, food.row, generateRandomPosition]);

  useEffect(() => {
    const gameInterval = setInterval(() => {
      handleGameTick();
    }, 100);

    return () => clearInterval(gameInterval);
  }, [direction, food, handleGameTick]);
  useEffect(() => {
    const handleKeyPress = (e: any) => {
      switch (e.key) {
        case "ArrowUp":
          setDirection((prevDirection) =>
            prevDirection !== "DOWN" ? "UP" : prevDirection
          );
          handleGameTick();
          break;
        case "ArrowDown":
          setDirection((prevDirection) =>
            prevDirection !== "UP" ? "DOWN" : prevDirection
          );
          handleGameTick();
          break;
        case "ArrowLeft":
          setDirection((prevDirection) =>
            prevDirection !== "RIGHT" ? "LEFT" : prevDirection
          );
          handleGameTick();
          break;
        case "ArrowRight":
          setDirection((prevDirection) =>
            prevDirection !== "LEFT" ? "RIGHT" : prevDirection
          );
          handleGameTick();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleGameTick]); // Empty dependency array, runs only once

  const renderGrid = () => {
    const grid = [];

    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        let cellType = "empty";

        if (snake.find((s) => s.row === i && s.col === j)) {
          cellType = "snake";

          if (i === snake[0].row && j === snake[0].col) {
            cellType += ` ${snake[0].direction.toLowerCase()}`;
          } else {
            const segment = snake.find((s) => s.row === i && s.col === j);
            if (!segment) continue;

            // Check if the segment is part of a turn
            const prevIndex = snake.indexOf(segment) - 1;
            const nextIndex = snake.indexOf(segment) + 1;

            if (
              (prevIndex >= 0 &&
                segment.direction !== snake[prevIndex].direction) ||
              (nextIndex < snake.length &&
                segment.direction !== snake[nextIndex].direction)
            ) {
              // Add the turn class based on specific turn directions
              const turnClass = getTurnClass(
                segment.direction,
                snake[prevIndex]?.direction
              );
              cellType += ` turn ${turnClass}`;
            } else {
              cellType += ` ${segment.direction.toLowerCase()}`;
            }
          }
        } else if (food.row === i && food.col === j) {
          cellType = "food";
        }

        grid.push(<div key={`${i}-${j}`} className={`cell ${cellType}`} />);
      }
    }

    return grid;
  };

  const getTurnClass = (
    currentDirection: string,
    prevDirection?: string
  ): string => {
    if (prevDirection === "UP" && currentDirection === "RIGHT") {
      return "turn-right-up";
    } else if (prevDirection === "UP" && currentDirection === "LEFT") {
      return "turn-left-up";
    } else if (prevDirection === "DOWN" && currentDirection === "RIGHT") {
      return "turn-right-down";
    } else if (prevDirection === "DOWN" && currentDirection === "LEFT") {
      return "turn-left-down";
    } else if (prevDirection === "RIGHT" && currentDirection === "UP") {
      return "turn-up-right";
    } else if (prevDirection === "RIGHT" && currentDirection === "DOWN") {
      return "turn-down-right";
    } else if (prevDirection === "LEFT" && currentDirection === "UP") {
      return "turn-up-left";
    } else if (prevDirection === "LEFT" && currentDirection === "DOWN") {
      return "turn-down-left";
    }

    return ""; // Default case
  };

  return <div className="snake-game">{renderGrid()}</div>;
};

export default SnakeGame;
