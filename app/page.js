"use client";

import Image from "next/image";
import {useChat} from "ai/react";

export default function Home() {
  const {isLoading, messages, input, handleInputChange, handleSubmit} =
    useChat();

  const noMessages = !messages || messages.length === 0;

  console.log(messages);

  return (
    <main>
      <Image
        layout="fill"
        src="/rs-big.webp"
        alt="RoadsideCoder Banner"
        objectFit="cover"
      />
      <div className="absolute px-4 w-full h-screen flex flex-col gap-5 items-center bottom-5">
        <h1 className="text-4xl font-Kanit md:text-5xl font-bold text-white mt-10">
          Piyush Agarwal&rsquo;s AI Portfolio
        </h1>

        <section className="w-full flex-1 flex flex-col overflow-y-scroll">
          {noMessages ? (
            <p className="text-center text-xl">Ask me Anything</p>
          ) : (
            <>
              {messages.map((message, index) => {
                return (
                  <div
                    className={`rounded-3xl ${
                      message.role === "user"
                        ? "rounded-br-none bg-blue-500 ml-auto"
                        : "rounded-bl-none bg-orange-700"
                    } m-2 p-2 px-4 w-[70%] md:w-[80%] mt-4 text-gray-200`}
                    key={`message-${index}`}
                  >
                    <b>{message.role === "user" ? "User:" : "Piyush:"}</b>{" "}
                    {message.content}
                  </div>
                );
              })}

              {isLoading && <span className="ml-auto">Thinking... 🤔</span>}
            </>
          )}
        </section>

        <form
          className="w-full flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
        >
          <input
            onChange={handleInputChange}
            value={input}
            type="text"
            placeholder="What's your hometown?"
            className="py-3 px-5 flex-1 rounded text-black text-2xl border-2 border-gray-50 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded text-xl  px-5 cursor-pointer focus:outline-none disabled:bg-blue-400"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}
