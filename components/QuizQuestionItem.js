import { createContext, useContext, useEffect, useState } from "react";
import { QuizContext } from "../lib/QuizContext"; 

/**import React, { useState, useContext, useEffect } from "react";
 * Since we are parsing a markup, it could happen that the options on a quiz have also markup of lists inside of them...
 * So, since these lists will be childrens of this option, we'll create a context per each list item if non exists already
 * and if it does exist, it will mean we are a child list and should not be counted as a quiz answer option.
 */
export const OptionIndexContext = createContext(false);

/**
 * Well, the markups located at data/% are not filled all in the same way, some people nest a bunch of lists
 * or don't have much idea of how markup works... so we must scan for all the node tree to find our special keyword 
 * --
 * this solution is based on visual observation of the "broken" quizzes... this solves the broken pattern i manage to figure out... 
 * i not sure what other patter will break the quiz next... time will tell...
 */
function findIfImAQuizOption(node) {
    if( node.children )
    {
        return node.children.some( findIfImAQuizOption )
    }
    else 
    {
        return node?.value.indexOf("%OPTION%") == 0;
    }
}




/**
 * This items represents one option item of the many available in a question.
 */

export default function QuizQuestionItem({ children, ...props }) {
    const quizContext = useContext(QuizContext);
    const optionContext = useContext(OptionIndexContext);
    const imAQuizOption = findIfImAQuizOption(props.node);

    if (optionContext || !imAQuizOption) {
        return <li className="list-disc list-inside my-1">{children}</li>;
    }

    const myIndex = ++quizContext.optionIndex;
    let bg = "bg-white";
    let borderColor = "#d1d5db"; // default border color for grey
    let borderWidth = "2"; // default border width
    let bgColor = "#ffffff"; // default background color for white

    if (quizContext.answered > -1) {
        if (quizContext.answer === myIndex) {
            bg = "bg-green-300 bgColorImportantGreen";
            borderColor = "#34d399"; // color code for bg-green-300 border
            borderWidth = "4"; // make border bolder for correct answer
            bgColor = "#66cb9d"; // color code for bg-green-300
        } else if (quizContext.answered === myIndex) {
            bg = "bg-red-500 bgColorImportantRed";
            borderColor = "#f87171"; // color code for bg-red-500 border
            borderWidth = "4"; // make border bolder for incorrect answer
            bgColor = "#f8d7da"; // color code for bg-red-500
        }
    }

    const onClick = () => {
        if (quizContext.answered < 0) {
            quizContext.onAnswer(myIndex);
        }
    };

    let childElements = {};
    if (typeof children === 'string') {
        if (children.indexOf("%OPTION%") === 0) {
            childElements = children.replace("%OPTION%", "");
        }
    } else if (Array.isArray(children) && children.length > 0) {
        childElements = [...children];
        if (childElements[0].indexOf("%OPTION%") === 0) {
            childElements[0] = childElements[0].replace("%OPTION%", "");
        }
    }

    const styleProps = {
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: borderWidth + 'px'
    };

    return (
        <li
            className={`p-3 shadow-md m-2 cursor-pointer border-l-${borderWidth} ${bg}`}
            style={{ ...styleProps }} // inline style for background and border color
            onClick={onClick}
            optkey={`${myIndex}:${quizContext.answer}`}
        >
            <OptionIndexContext.Provider value={true}>
                {childElements}
            </OptionIndexContext.Provider>
        </li>
    );
}
