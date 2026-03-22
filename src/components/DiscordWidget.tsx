"use client";

import React, { useEffect, useState } from "react";

interface DiscordMember {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  status: string;
  avatar_url: string;
}

interface DiscordData {
  id: string;
  name: string;
  instant_invite: string;
  presence_count: number;
  members: DiscordMember[];
}

export default function DiscordWidget() {
  const [data, setData] = useState<DiscordData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscordData = async () => {
      try {
        const response = await fetch(
          "https://ptb.discord.com/api/guilds/1483923936717570238/widget.json"
        );
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching Discord widget:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscordData();
    // Refresh data setiap 1 menit agar status tetap update
    const interval = setInterval(fetchDiscordData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-gray-400 animate-pulse">📡 Syncing with Core Dev Infrastructure...</div>;
  if (!data) return null;

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-2xl max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-wider">{data.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <p className="text-sm text-gray-400">{data.presence_count} Citizens Online</p>
          </div>
        </div>
        <img 
          src="/logo.png" 
          alt="Core Dev" 
          className="w-12 h-12 rounded-lg border border-white/20"
        />
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-xs text-gray-500 uppercase font-semibold">Active Members</p>
        <div className="flex -space-x-2 overflow-hidden">
          {data.members.slice(0, 8).map((member) => (
            <img
              key={member.id}
              className="inline-block h-8 w-8 rounded-full ring-2 ring-black"
              src={member.avatar_url}
              alt={member.username}
              title={member.username}
            />
          ))}
          {data.members.length > 8 && (
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-800 ring-2 ring-black text-[10px] text-white">
              +{data.members.length - 8}
            </div>
          )}
        </div>
      </div>

      <a
        href={data.instant_invite}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        JOIN COMMUNITY
      </a>
      
      <p className="text-[10px] text-center text-gray-600 mt-4 tracking-widest uppercase">
        Infrastructure Status: Secure 🟢
      </p>
    </div>
  );
}