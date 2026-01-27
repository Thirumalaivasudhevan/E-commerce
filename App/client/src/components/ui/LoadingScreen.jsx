import React from 'react';
import { motion } from 'framer-motion'; // Assuming framer-motion is installed
import { Loader2 } from 'lucide-react'; // Assuming lucide-react is installed

const LoadingScreen = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-black text-white">
            <div className="relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        duration: 0.8,
                        ease: [0, 0.71, 0.2, 1.01],
                        scale: {
                            type: "spring",
                            damping: 5,
                            stiffness: 100,
                            restDelta: 0.001
                        }
                    }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                        Nexus
                    </h1>
                </motion.div>
            </div>
        </div>
    );
};

export default LoadingScreen;
