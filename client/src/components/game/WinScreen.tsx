import { useEffect } from "react";
import { useParadeGame } from "@/lib/stores/useParadeGame";
import { useAudio } from "@/lib/stores/useAudio";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function WinScreen() {
  const { phase, score, resetGame } = useParadeGame();
  const { playSuccess } = useAudio();
  
  useEffect(() => {
    if (phase === "won") {
      playSuccess();
    }
  }, [phase, playSuccess]);
  
  if (phase !== "won") return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        colors={["#9b59b6", "#ff6b35", "#ffd700", "#e74c3c"]}
        numberOfPieces={300}
        recycle={false}
        gravity={0.3}
      />
      
      <Card className="bg-gradient-to-br from-purple-900/95 to-orange-900/95 border-4 border-yellow-400 p-12 max-w-2xl mx-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold text-yellow-300 mb-4">
            🎉 You Won! 🎉
          </h1>
          
          <div className="text-4xl text-white mb-8">
            You caught all {score} throws!
          </div>
          
          <p className="text-2xl text-yellow-200 mb-8">
            Congratulations! You're a true Krew of Boo parade champion!
          </p>
          
          <Button
            onClick={resetGame}
            size="lg"
            className="text-2xl py-6 px-12 bg-yellow-500 hover:bg-yellow-400 text-purple-900 font-bold"
          >
            Play Again
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );
}
