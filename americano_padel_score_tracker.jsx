import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Users } from "lucide-react";

const players = ["Nika", "Irakli", "Iska", "Gio", "Levani"];

const rounds = [
  { round: 1, team1: ["Levani", "Irakli"], team2: ["Iska", "Nika"], rest: "Gio" },
  { round: 2, team1: ["Levani", "Gio"], team2: ["Irakli", "Iska"], rest: "Nika" },
  { round: 3, team1: ["Levani", "Nika"], team2: ["Gio", "Irakli"], rest: "Iska" },
  { round: 4, team1: ["Levani", "Iska"], team2: ["Nika", "Gio"], rest: "Irakli" },
  { round: 5, team1: ["Irakli", "Nika"], team2: ["Iska", "Gio"], rest: "Levani" },
];

export default function AmericanoPadelScoreTracker() {
  const [scores, setScores] = useState(
    rounds.reduce((acc, r) => {
      acc[r.round] = { team1: "", team2: "" };
      return acc;
    }, {})
  );

  const updateScore = (round, team, value) => {
    const normalized = value.replace(/[^0-3]/g, "").slice(0, 1);
    setScores((prev) => ({
      ...prev,
      [round]: { ...prev[round], [team]: normalized },
    }));
  };

  const standings = useMemo(() => {
    const table = players.reduce((acc, name) => {
      acc[name] = { player: name, points: 0, played: 0, wins: 0, draws: 0, losses: 0 };
      return acc;
    }, {});

    rounds.forEach((r) => {
      const s1 = Number(scores[r.round]?.team1);
      const s2 = Number(scores[r.round]?.team2);
      const valid = scores[r.round]?.team1 !== "" && scores[r.round]?.team2 !== "" && s1 + s2 === 3;
      if (!valid) return;

      r.team1.forEach((p) => {
        table[p].points += s1;
        table[p].played += 1;
        if (s1 > s2) table[p].wins += 1;
        else if (s1 === s2) table[p].draws += 1;
        else table[p].losses += 1;
      });
      r.team2.forEach((p) => {
        table[p].points += s2;
        table[p].played += 1;
        if (s2 > s1) table[p].wins += 1;
        else if (s2 === s1) table[p].draws += 1;
        else table[p].losses += 1;
      });
    });

    return Object.values(table).sort((a, b) => b.points - a.points || b.wins - a.wins || a.player.localeCompare(b.player));
  }, [scores]);

  const reset = () => {
    setScores(rounds.reduce((acc, r) => {
      acc[r.round] = { team1: "", team2: "" };
      return acc;
    }, {}));
  };

  const isValidRound = (round) => {
    const s1 = scores[round]?.team1;
    const s2 = scores[round]?.team2;
    return s1 !== "" && s2 !== "" && Number(s1) + Number(s2) === 3;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Users className="h-4 w-4" /> Americano Padel
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Score Tracker</h1>
            <p className="mt-1 text-slate-600">Enter each round score. Every round must total 3 games, for example 3–0 or 2–1.</p>
          </div>
          <Button onClick={reset} variant="outline" className="rounded-2xl">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            {rounds.map((r) => {
              const valid = isValidRound(r.round);
              const filled = scores[r.round].team1 !== "" || scores[r.round].team2 !== "";
              return (
                <Card key={r.round} className="rounded-3xl shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-xl font-bold">Round {r.round}</h2>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">Rest: {r.rest}</span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      <div className="rounded-2xl bg-slate-100 p-4 text-center">
                        <div className="text-lg font-semibold">{r.team1.join(" + ")}</div>
                        <input
                          inputMode="numeric"
                          value={scores[r.round].team1}
                          onChange={(e) => updateScore(r.round, "team1", e.target.value)}
                          placeholder="0-3"
                          className="mt-3 w-20 rounded-2xl border border-slate-200 bg-white p-3 text-center text-2xl font-bold outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>

                      <div className="text-lg font-bold text-slate-400">vs</div>

                      <div className="rounded-2xl bg-slate-100 p-4 text-center">
                        <div className="text-lg font-semibold">{r.team2.join(" + ")}</div>
                        <input
                          inputMode="numeric"
                          value={scores[r.round].team2}
                          onChange={(e) => updateScore(r.round, "team2", e.target.value)}
                          placeholder="0-3"
                          className="mt-3 w-20 rounded-2xl border border-slate-200 bg-white p-3 text-center text-2xl font-bold outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>
                    </div>

                    {filled && !valid && (
                      <p className="mt-3 text-sm font-medium text-red-600">Score must total exactly 3 games.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="h-fit rounded-3xl shadow-sm lg:sticky lg:top-6">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                <h2 className="text-xl font-bold">Standings</h2>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-sm text-slate-600">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Player</th>
                      <th className="p-3 text-center">Pts</th>
                      <th className="p-3 text-center">W</th>
                      <th className="p-3 text-center">P</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, index) => (
                      <tr key={s.player} className="border-t border-slate-200 bg-white">
                        <td className="p-3 font-bold">{index + 1}</td>
                        <td className="p-3 font-semibold">{s.player}</td>
                        <td className="p-3 text-center text-lg font-bold">{s.points}</td>
                        <td className="p-3 text-center">{s.wins}</td>
                        <td className="p-3 text-center">{s.played}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-sm text-slate-600">
                Points are calculated individually. If your team wins 2 games in a round, both players get 2 points.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
