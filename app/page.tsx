"use client"
import { useEffect, useRef, useState } from 'react';
import Image from "next/image";
import styles from './page.module.css';

export default function Home() {
  const [arrows, setArrows] = useState<{ x: number; y: number; length: number }[]>([]);
  const [obliqueArrows, setObliqueArrows] = useState<{ startX: number, startY: number, midX: number, midY: number, endX: number, endY: number }[]>([]);
  const [singleBoxRows, setSingleBoxRows] = useState<boolean>(true); // New state to track if all rows have only one box

  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (gridRef.current) {
      const boxes = gridRef.current.children;
      let lastBoxInRow = [];
      let firstBoxInRow = [];
      let currentRowTop = (boxes[0] as HTMLElement).offsetTop;
      let rowBoxCount = 0;
      let allSingleBoxRows = true; // Assume all rows have one box initially

      for (let i = 0; i < boxes.length; i++) {
        if ((boxes[i] as HTMLElement).offsetTop > currentRowTop) {
          if (rowBoxCount > 1) {
            allSingleBoxRows = false; // Found a row with more than one box
          }
          lastBoxInRow.push(boxes[i - 1]);
          firstBoxInRow.push(boxes[i]);
          currentRowTop = (boxes[i] as HTMLElement).offsetTop;
          rowBoxCount = 1; // Reset count for the new row
        } else {
          rowBoxCount++;
        }
      }
      if (rowBoxCount > 1) {
        allSingleBoxRows = false; // Check the last row
      }
      lastBoxInRow.push(boxes[boxes.length - 1]); // Add the last box of the last row

      setSingleBoxRows(allSingleBoxRows); // Update state

      const newArrows = [];
      const newObliqueArrows = [];
      for (let i = 0; i < boxes.length; i++) {
        if (!lastBoxInRow.includes(boxes[i])) {
          const box = boxes[i] as HTMLElement;
          const nextBox = boxes[i + 1] as HTMLElement;
          const arrowLength = 0.8 * (nextBox.offsetLeft - box.offsetLeft - box.offsetWidth);
          const arrowCenterX = box.offsetLeft + box.offsetWidth + (nextBox.offsetLeft - (box.offsetLeft + box.offsetWidth)) / 2;
          const arrowCenterY = box.offsetTop + box.offsetHeight / 2;

          newArrows.push({
            x: arrowCenterX,
            y: arrowCenterY,
            length: arrowLength,
          });
        }
      }

      for (let i = 0; i < lastBoxInRow.length - 1; i++) {
        const lastBox = lastBoxInRow[i] as HTMLElement;
        const firstBoxNextRow = firstBoxInRow[i] as HTMLElement;
        if (firstBoxNextRow) {
          const startX = lastBox.offsetLeft + lastBox.offsetWidth / 2;
          const startY = lastBox.offsetTop + lastBox.offsetHeight + 5;
          const midX = (startX + firstBoxNextRow.offsetLeft) / 2;
          const midY = (startY + firstBoxNextRow.offsetTop) / 2;
          const endX = firstBoxNextRow.offsetLeft + firstBoxNextRow.offsetWidth / 2;
          const endY = firstBoxNextRow.offsetTop - 5;

          newObliqueArrows.push({
            startX,
            startY,
            midX,
            midY,
            endX,
            endY,
          });
        }
      }

      setArrows(newArrows);
      setObliqueArrows(newObliqueArrows);
    }
  }, [window.innerWidth]);

  return (
    <main className="flex flex-col justify-center items-center p-16">
      <div className="relative w-[50%]">
        <div ref={gridRef} className={`${styles.gridContainer} relative`}>
          <div className={styles.box}></div>
          <div className={styles.box}></div>
          <div className={styles.box}></div>
          <div className={styles.box}></div>
          <div className={styles.box}></div>
          <div className={styles.box}></div>
          <div className={styles.box}></div>
          <div className={styles.box}></div>
        </div>
        {/* Render arrows */}
        <svg className="absolute top-0 left-0 w-full h-full">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 7 3.5, 0 7" fill="black" />
            </marker>
          </defs>
          {arrows.map((arrow, index) => (
            <g key={index} transform={`translate(${arrow.x}, ${arrow.y})`}>
              <line
                x1={-arrow.length / 2}
                y1={0}
                x2={arrow.length / 2}
                y2={0}
                stroke="black"
                strokeWidth="2"
              />
              <polygon
                points={`${arrow.length / 2 - 5},-5 ${arrow.length / 2 + 5},0 ${arrow.length / 2 - 5},5`}
                fill="black"
              />
            </g>
          ))}
          {obliqueArrows.map((arrow, index) => (
            singleBoxRows ? (
              <path
                key={index}
                d={`M${arrow.startX},${arrow.startY} 
                   Q${arrow.endX},${arrow.midY} ${arrow.endX},${arrow.endY}`}
                stroke="black"
                fill="transparent"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            ) : (
              <path
                key={index}
                d={`M${arrow.startX},${arrow.startY} 
                   L${arrow.startX},${arrow.midY - 5}
                   Q${arrow.startX},${arrow.midY} ${arrow.midX},${arrow.midY} 
                   L${arrow.endX + 20},${arrow.midY}
                   Q${arrow.endX - 2},${arrow.midY} ${arrow.endX},${arrow.endY}`}
                stroke="black"
                fill="transparent"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            )
          ))}
        </svg>
      </div>
      {/* Display if all rows have only one box */}
      {singleBoxRows ? <p>All rows have only one box.</p> : <p>Not all rows have only one box.</p>}
    </main>
  );
}