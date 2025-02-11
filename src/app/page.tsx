"use client";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sun, Moon, Sparkles, MessageSquareText, Hash, Clock } from "lucide-react";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { mainnet } from "wagmi/chains";

export default function Home() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const fetchAIResponse = async (feature: string) => {
    setLoading(true);
    setResult("");

    const prompt =
      feature === "content"
        ? `Give me a content idea for: ${input}`
        : feature === "hashtags"
        ? `Suggest hashtags for: ${input}`
        : feature === "caption"
        ? `Write an Instagram caption for: ${input}`
        : `When is the best time to post about: ${input}`;

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setResult(data.result || "No response.");
    setLoading(false);
  };


  const { chains, publicClient } = configureChains([mainnet], [publicProvider()]);
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: connectorsForWallets([]),
    publicClient,
  });

  const payWithCrypto = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      try {
        const tx = await signer.sendTransaction({
          to: "0xYourWalletAddressHere",  // Change this to your receiving crypto wallet
          value: ethers.parseEther("0.01"), // Example: Charge 0.01 ETH
        });
        await tx.wait();
        alert("Payment Successful!");
      } catch (error) {
        console.error(error);
        alert("Payment Failed!");
      }
    } else {
      alert("No crypto wallet detected!");
    }
  };
  
  <WagmiConfig config={wagmiConfig}>
    <RainbowKitProvider chains={chains}>
      <div className="flex flex-col items-center">
        <ConnectButton />
        <Button onClick={payWithCrypto} className="mt-4">Pay with Crypto</Button>
      </div>
    </RainbowKitProvider>
  </WagmiConfig>
 


  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen p-6 transition-all ${
        darkMode ? "bg-black text-purple-300" : "bg-gray-100 text-gray-900"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-6 flex items-center space-x-4"
      >
        <motion.img
          src="/genie.gif"
          alt="Genie Animation"
          className="w-40 h-40"
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />

        <h1 className="text-4xl font-bold">Content Idea Generator</h1>
      </motion.div>

      {!session ? (
        <Button
          className="mb-4 flex items-center px-6 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg"
          onClick={() => signIn("google")}
        >
          <Sparkles className="mr-2" /> Sign in with Google
        </Button>
      ) : (
        <>
          <p className="text-lg font-semibold mb-4">Welcome, {session.user?.name}!</p>
          <Button
            className="mb-4 px-6 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </>
      )}

      <motion.div
        className="w-full max-w-lg p-6 bg-white shadow-lg rounded-xl transition-all"
        whileHover={{ scale: 1.02 }}
      >
        <Input
          type="text"
          placeholder="Enter your niche or topic..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button className="flex items-center justify-center" onClick={() => fetchAIResponse("content")}>
            <MessageSquareText className="mr-2" /> Generate Content
          </Button>
          <Button className="flex items-center justify-center" onClick={() => fetchAIResponse("hashtags")}>
            <Hash className="mr-2" /> Get Hashtags
          </Button>
          <Button className="flex items-center justify-center" onClick={() => fetchAIResponse("caption")}>
            <Sparkles className="mr-2" /> Create Caption
          </Button>
          <Button className="flex items-center justify-center" onClick={() => fetchAIResponse("bestTime")}>
            <Clock className="mr-2" /> Best Posting Time
          </Button>
        </div>

        {loading && <p className="text-gray-600 mt-4">Generating...</p>}
        {result && (
          <motion.div
            className="p-4 mt-4 bg-gray-50 border border-gray-200 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg">{result}</p>
          </motion.div>
        )}
      </motion.div>

      <button
        className="fixed bottom-4 right-4 p-3 rounded-full transition-all"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? <Sun className="text-yellow-400" size={32} /> : <Moon className="text-purple-700" size={32} />}
      </button>
    </main>
  );
}
