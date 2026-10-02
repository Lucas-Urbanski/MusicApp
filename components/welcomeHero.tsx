import React from "react";

interface WelcomeHeroProps {
  userName?: string;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  userName = "Your Mom",
}) => {
  return (
    <div className="w-full max-w-3xl mt-24 px-6 flex flex-col items-start justify-center flex-1">
      <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-2">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-red-400">
          Hello, {userName}
        </span>
      </h1>
      <p className="text-4xl sm:text-5xl font-medium text-[#444746]">
        What sound are you looking for?
      </p>
    </div>
  );
};
