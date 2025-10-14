import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import GlobalStyles from "../../styles/global";

export default function TarneebScreen() {
  const [gameType, setGameType] = useState<"individual" | "teams">("individual");
  const [winScore, setWinScore] = useState(61);
  const [started, setStarted] = useState(false);
  const [rounds, setRounds] = useState<any[]>([]);
  const [roundStarted, setRoundStarted] = useState(false);
  const [players, setPlayers] = useState(["You 🧐", "Partner 🤡", "On your right 👉", "On your left 👈"]);
  const [teams, setTeams] = useState(["You ⭐", "Them 💀"]);
  const [playerCount, setPlayerCount] = useState<number>(2);

  const [scores, setScores] = useState<number[]>([0]);
  const [calls, setCalls] = useState<number[]>([0]);
  const [totals, setTotals] = useState<number[]>([0]);
  const [error, setError] = useState("");
  const [winTeam, setWinTeam] = useState("");

  // Start the game and set variables
  const handleStart = () => {
    // Num of players
    let count = gameType === "individual" ? 4 : 2
    setPlayerCount(count);
    // Reset total and round variables
    setTotals(Array(count).fill(0));
    resetRound(count);

    setStarted(true);
  };

  // Reset round variables
  const resetRound = (count: number) => {
    setRoundStarted(false);
    setScores(Array(count).fill(0));
    setCalls(Array(count).fill(2));
  }

  // Calculate rounds
  const toggleRound = () => {
    const totalCalls = calls.reduce((sum, val) => sum + val, 0);
    const totalScores = scores.reduce((sum, val) => sum + val, 0);

    // If round not started save (calls) if started save (scores) and reset round
    if(!roundStarted) {
        if(totalCalls < 13) {
            setError(`Total calls should be at least equal to 13 right now the total calls are ${totalCalls}`);
        } else {
            setError("");
            setRoundStarted(true);
        }
    } else {
        if(totalScores !== 13) {
            setError(`Total scores should be equal to 13 right now the total scores are ${totalScores}`);
        } else {
            setError("");
            let updated = [...totals];
            totals.map((t, i) => {
                if(calls[i] > scores[i]) {
                    updated[i] -= calls[i]
                } else {
                    updated[i] += scores[i]
                }
                if(updated[i] > winScore) {
                    setWinTeam(players[i]);
                }
            });
            addRound(calls, scores);
            setTotals(updated);
            resetRound(playerCount);
            if(winTeam !== "") {
                endGame(winTeam);
            }
        }
        
    }
  }

  // Add round to table of rounds
  const addRound = (calls: number[], scores: number[]) => {
    setRounds([...rounds, { calls, scores }]);
  };

  // Revert back last round
  const revertLastRound = () => {
    if (rounds.length === 0) return;
  
    const updatedRounds = [...rounds];
    const lastRound = updatedRounds.pop();
  
    // Recalculate totals by removing the last round’s effect
    const updatedTotals = [...totals];
    lastRound.calls.forEach((call: number, i: number) => {
      if (call > lastRound.scores[i]) {
        updatedTotals[i] += call; // we had subtracted before, so we add it back
      } else {
        updatedTotals[i] -= lastRound.scores[i]; // we had added before, so subtract it back
      }
    });
  
    setRounds(updatedRounds);
    setTotals(updatedTotals);
    setWinTeam("");
  };

  // End game
  const endGame = (name: string) => {
    console.log(`Player ${name} won!`);
  }

  // Choose game type before start
  if (!started) {
    return (
      <View style={GlobalStyles.container}>
        <Text style={GlobalStyles.title}>Tarneeb Setup</Text>

        {/* Game Type Buttons */}
        <View style={GlobalStyles.row}>
          <Pressable
            style={[
              GlobalStyles.button,
              gameType === "individual" && { backgroundColor: "#2E7D32" }, // darker green when active
            ]}
            onPress={() => setGameType("individual")}
          >
            <Text style={GlobalStyles.buttonText}>Individual</Text>
          </Pressable>

          <Pressable
            style={[
              GlobalStyles.button,
              gameType === "teams" && { backgroundColor: "#2E7D32" },
            ]}
            onPress={() => setGameType("teams")}
          >
            <Text style={GlobalStyles.buttonText}>Teams</Text>
          </Pressable>
        </View>

        {/* Players Input */}
        {gameType === "individual" && (
          <>
            {players.map((p, i) => (
              <TextInput
                key={i}
                placeholder={`${players[i]}`}
                style={GlobalStyles.input}
                value={p}
                onChangeText={(text) => {
                  const copy = [...players];
                  copy[i] = text;
                  setPlayers(copy);
                }}
              />
            ))}
          </>
        )}

        {gameType === "teams" && (
          <>
            <TextInput 
                placeholder={`${teams[0]}`} style={GlobalStyles.input}
                value={teams[0]}
                onChangeText={(text) => {
                    const copy = [...teams];
                    copy[0] = text;
                    setTeams(copy);
                }}
            />
            <TextInput
                placeholder="Team 2 Name"
                style={GlobalStyles.input}
                value={teams[1]}
                onChangeText={(text) => {
                    const copy = [...teams];
                    copy[1] = text;
                    setTeams(copy);
                }}
            />
          </>
        )}

        <Text style={GlobalStyles.title}>Win Score:</Text>
        <View style={GlobalStyles.row}>
            {[61, 48].map((score) => (
                <Pressable
                    key={score}
                    style={[GlobalStyles.option, winScore === score && GlobalStyles.selected]}
                    onPress={() => setWinScore(score)}
                >
                    <Text style={GlobalStyles.h2}>{score}</Text>    
                </Pressable>
            ))}
        </View>

        <Pressable style={GlobalStyles.button} onPress={handleStart}>
          <Text style={GlobalStyles.buttonText}>Start Game</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.container}>
      <Text style={GlobalStyles.title}>Tarneeb Game Rounds</Text>
      {winTeam !== "" && (
        <Text style={[GlobalStyles.title, ({ color: "green" })]}>Player {winTeam} Won! 🎆</Text>
      )}

      {/* Table Header */}
      <View style={GlobalStyles.row}>
        <Text style={GlobalStyles.labelCell}></Text>
        {teams.map((t, i) => (
            <Text style={GlobalStyles.teamCell}>{teams[i]}</Text>
        ))}
      </View>
      {playerCount === 4 && (
        <View style={GlobalStyles.row}>
            <Text style={GlobalStyles.labelCell}></Text> 
            {players.map((p, i) => (
                <Text key={i} style={GlobalStyles.cell}>
                    {p || `P${i + 1}`}
                </Text>
            ))}
        </View>
      )}

      {/* Rounds */}
      <FlatList
        data={rounds}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View>
            <View style={GlobalStyles.row}>
              <Text style={GlobalStyles.labelCell}>Round {index + 1} Calls</Text>
              {item.calls.map((c: number, i: number) => (
                <Text key={i} style={GlobalStyles.cell}>{c}</Text>
              ))}
            </View>
            <View style={GlobalStyles.row}>
              <Text style={GlobalStyles.labelCell}>Scores</Text>
              {item.scores.map((s: number, i: number) => (
                <Text key={i} style={GlobalStyles.cell}>{s}</Text>
              ))}
            </View>
          </View>
        )}
      />

      {/* Totals */}
      <View style={GlobalStyles.row}>
        <Text style={GlobalStyles.labelCell}>Totals</Text>
        {totals.map((t, i) => (
          <Text key={i} style={GlobalStyles.cell}>{t}</Text>
        ))}
      </View>

      {/* Add Round */}
      <Text style={GlobalStyles.title}>Round #{rounds.length + 1}</Text>
      {!roundStarted && (
        <>
        <View style={GlobalStyles.row}>
            <Text style={GlobalStyles.labelCell}>Calls</Text>
            
            {calls.map((c, i) => (
            <TextInput
                key={i}
                editable={!winTeam}
                placeholder={`${calls[i]}`}
                style={GlobalStyles.cell}
                value={c.toString()}
                onChangeText={(text) => {
                    const updated = [...calls];
                    updated[i] = Number(text);;
                    setCalls(updated);
                    return;
                }}
                onSubmitEditing={() => {
                    if (calls[i] < 2 || calls[i] > 13) {
                        const updated = [...calls];
                        updated[i] = 2;
                        setCalls(updated);
                        return;
                    }
                }}
            />
            ))}
        </View>
        </>
      )}

      {roundStarted && (
        <>
        <View style={GlobalStyles.row}>
            <Text style={GlobalStyles.labelCell}>Calls</Text>
            {calls.map((c, i) => (
                <Text style={GlobalStyles.cell}>{calls[i]}</Text>
            ))}
        </View>
        <View style={GlobalStyles.row}>
            <Text style={GlobalStyles.labelCell}>Scores</Text>
            {scores.map((s, i) => (
                <TextInput
                    key={i}
                    editable={!winTeam}
                    placeholder={`${scores[i]}`}
                    style={GlobalStyles.cell}
                    value={s.toString()}
                    onChangeText={(text) => { 
                        const updated = [...scores];
                        updated[i] = Number(text);;
                        setScores(updated);
                        return;
                    }}
                    onSubmitEditing={() => {
                        if (scores[i] > 13) {
                            const updated = [...scores];
                            updated[i] = 13;
                            setScores(updated);
                            return;
                        }
                    }}
                />
            ))}
        </View>
        </>
      )}
      {error !== "" && (
        <Text style={[GlobalStyles.h1, {color: "red"}]}>{error}</Text>
      )}
      {rounds.length > 0 && (
        <Pressable
          style={[GlobalStyles.button, { backgroundColor: "#d32f2f", marginTop: 10 }]}
          onPress={revertLastRound}
        >
          <Text style={{ color: "#fff" }}>Revert Last Round</Text>
        </Pressable>
      )}
      <Pressable
        style={GlobalStyles.button}
        onPress={() => toggleRound()}
      >
        <Text style={{ color: "#fff" }}>{roundStarted ? "End Round" : "Start Round"}</Text>
      </Pressable>
    </View>
  );
}
