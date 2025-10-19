"use client"

import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { Checkbox } from 'react-native-paper';
import GlobalStyles from "../../styles/global";

export default function BalootScreen() {
  const [gameType, setGameType] = useState<"Sun" | "Hukum">("Hukum")
  const [youPoints, setYouPoints] = useState(0)
  const [themPoints, setThemPoints] = useState(0)
  const [rounds, setRounds] = useState<any[]>([])
  const [error, setError] = useState("")
  const [winTeam, setWinTeam] = useState("")
  const [showMasharea, setShowMasharea] = useState(false)
  const [showGaidConfirm, setShowGaidConfirm] = useState<null | "you" | "them">(null)
  const [showEndGame, setShowEndGame] = useState(false)
  const [advancedSettings, setAdvancedSettings] = useState(true)

  const [youInput, setYouInput] = useState({ points: "", abnat: "", masharea: {} as any })
  const [themInput, setThemInput] = useState({ points: "", abnat: "", masharea: {} as any })

  const [youLastEdited, setYouLastEdited] = useState<"points" | "abnat" | "">("")
  const [themLastEdited, setThemLastEdited] = useState<"points" | "abnat" | "">("")

  const WIN_SCORE = 152

  const mashareaImages: Record<string, any> = {
    Sira: require("../../assets/images/Baloot/Sira.png"),
    "50": require("../../assets/images/Baloot/50.png"),
    "100": require("../../assets/images/Baloot/100.png"),
    "400": require("../../assets/images/Baloot/400.png"),
    Baloot: require("../../assets/images/Baloot/Baloot.png"),
  }

  const mashareaTypes: any = {
    Sira: 20,
    "50": 50,
    "100": 100,
    "400": 400,
    Baloot: 20,
  }

  // if Sun (points*10/2) else (points*10)
  const calculateAbnat = (points: number, type: "Sun" | "Hukum") =>
    isNaN(points) ? 0 : type === "Sun" ? (points * 10) / 2 : points * 10

  // if Sun (abnat % 10 === 5 => abnat/10*2 else round(abnat/10)*2) else (abnat/10)
  const calculatePoints = (abnat: number, type: "Sun" | "Hukum") =>
    isNaN(abnat) ? 0 : type === "Sun" ? 
    (abnat % 10 === 5 ?  (abnat / 10) * 2 : Math.round(abnat / 10) * 2)
    : abnat / 10
  
  const totalMashareaAbnat = (team: any) => {
    let extra = 0
    for (const mashroo in team.masharea) {
      extra += (mashareaTypes[mashroo] || 0) * team.masharea[mashroo]
    }
    return extra
  }

  const totalAbnat = (input: any) => {
    const base = Number(input.abnat || 0)
    return base + totalMashareaAbnat(input)
  }

  useEffect(() => {
    if (youLastEdited === "points") {
      const abnat = calculateAbnat(Number(youInput.points), gameType)
      setYouInput((prev) => ({ ...prev, abnat: abnat ? abnat.toFixed(0) : "" }))
    } else if (youLastEdited === "abnat") {
      const pts = calculatePoints(Number(youInput.abnat), gameType)
      setYouInput((prev) => ({ ...prev, points: pts ? pts.toFixed(0) : "" }))
    }
  }, [youInput.points, youInput.abnat, gameType, youLastEdited])

  useEffect(() => {
    if (themLastEdited === "points") {
      const abnat = calculateAbnat(Number(themInput.points), gameType)
      setThemInput((prev) => ({ ...prev, abnat: abnat ? abnat.toFixed(0) : "" }))
      console.log(abnat);
    } else if (themLastEdited === "abnat") {
      const pts = calculatePoints(Number(themInput.abnat), gameType)
      setThemInput((prev) => ({ ...prev, points: pts ? pts.toFixed(0) : "" }))
    }
  }, [themInput.points, themInput.abnat, gameType, themLastEdited])

  const handleAutoCalculate = () => {
    const baseTotal = gameType === "Sun" ? 130 : 162
    const totalBonus = totalMashareaAbnat(youInput) + totalMashareaAbnat(themInput)
    const totalRoundAbnat = baseTotal + totalBonus

    const youAbnat = Number(youInput.abnat || 0)
    const themAbnat = Number(themInput.abnat || 0)
    let kaboot = "";

    if (youAbnat && !themAbnat) {
      setError("")
      const remaining = Math.max(totalRoundAbnat - youAbnat, 0)
      if(remaining === 0) kaboot = "you";
      const pts = calculatePoints(remaining, gameType)
      console.log(remaining.toFixed(0), remaining);
      setThemInput({
        ...themInput,
        abnat: remaining.toFixed(0),
        points: pts.toFixed(0),
      })
    } else if (themAbnat && !youAbnat) {
      const remaining = Math.max(totalRoundAbnat - themAbnat, 0)
      if(remaining === 0) kaboot = "them";
      const pts = calculatePoints(remaining, gameType)
      setYouInput({
        ...youInput,
        abnat: remaining.toFixed(0),
        points: pts.toFixed(0),
      })
    } else {
      setError("Please fill only one team's values before auto calculating.")
    }
    if(kaboot === "them") {
      setThemInput({
        ...themInput,
        abnat: (totalRoundAbnat + 90).toFixed(1),
        points: calculatePoints(totalRoundAbnat, gameType).toFixed(0),
      })
    } else if (kaboot === "you") {
      setYouInput({
        ...youInput,
        abnat: (totalRoundAbnat + 90).toFixed(1),
        points: calculatePoints(totalRoundAbnat, gameType).toFixed(0),
      })
    }
  }

  const openMasharea = () => setShowMasharea(true)

  const modifyMasharea = (team: "you" | "them", key: string, delta: number) => {
    const isYou = team === "you"
    const target = isYou ? youInput : themInput
    const opponent = isYou ? themInput : youInput
  
    const updated = { ...target.masharea }
    const newCount = (updated[key] || 0) + delta
  
    // ⚙️ Define limits
    const limits: Record<string, number> = {
      Sira: 4,
      50: 4,
      100: 4,
      400: 1,
      Baloot: 1,
    }
  
    // 🧠 1. Respect min/max limits
    if (newCount < 0) return // no negatives
    if (limits[key] && newCount > limits[key]) return // exceed limit
    if (newCount === 0) delete updated[key]
    else updated[key] = newCount
  
    // 🧩 2. Exclusive masharea logic
    const strongKeys = ["Sira", "50", "100", "400"]
    const hasStrong = strongKeys.some((k) => updated[k] && updated[k] > 0)
  
    // If this team has any strong masharea, the other team cannot have any except Baloot
    if (hasStrong) {
      const opponentUpdated = { ...opponent.masharea }
      Object.keys(opponentUpdated).forEach((k) => {
        if (k !== "Baloot") delete opponentUpdated[k]
      })
      if (isYou) setThemInput((prev) => ({ ...prev, masharea: opponentUpdated }))
      else setYouInput((prev) => ({ ...prev, masharea: opponentUpdated }))
    }
  
    // 🧩 3. If the *opponent* already has a strong masharea, block this team from getting one (except Baloot)
    const opponentHasStrong = strongKeys.some((k) => opponent.masharea[k] && opponent.masharea[k] > 0)
    if (opponentHasStrong && key !== "Baloot" && delta > 0) return // block adding non-Baloot
  
    // ✅ 4. Commit updates
    if (isYou) setYouInput((prev) => ({ ...prev, masharea: updated }))
    else setThemInput((prev) => ({ ...prev, masharea: updated }))
  }
  

  const confirmMasharea = () => {
    setShowMasharea(false)
    const youExtra = totalAbnat(youInput)
    const themExtra = totalAbnat(themInput)
    setYouInput((prev) => ({
      ...prev,
      abnat: youExtra.toFixed(1),
      points: calculatePoints(youExtra, gameType).toFixed(0),
    }))
    setThemInput((prev) => ({
      ...prev,
      abnat: themExtra.toFixed(1),
      points: calculatePoints(themExtra, gameType).toFixed(0),
    }))
  }

  const addRound = (customRound?: any) => {
    const youPts = Number(youInput.points) || 0
    const themPts = Number(themInput.points) || 0

    const defaultRound = {
      type: gameType,
      you: { points: youPts, abnat: calculateAbnat(youPts, gameType), masharea: youInput.masharea || {} },
      them: { points: themPts, abnat: calculateAbnat(themPts, gameType), masharea: themInput.masharea || {} },
      gaid: false,
    }

    const newRound = customRound && customRound.you && customRound.them ? customRound : defaultRound

    if (!customRound && youPts === 0 && themPts === 0) {
      setError("Please enter at least one team's data")
      return
    }

    const youRoundPoints = newRound?.you?.points ?? 0
    const themRoundPoints = newRound?.them?.points ?? 0

    const newYou = youPoints + youRoundPoints
    const newThem = themPoints + themRoundPoints

    setRounds((prev) => [...prev, newRound])
    setYouPoints(newYou)
    setThemPoints(newThem)
    setError("")
    setYouInput({ points: "", abnat: "", masharea: {} })
    setThemInput({ points: "", abnat: "", masharea: {} })

    if (newYou >= WIN_SCORE) endGame("You ⭐")
    if (newThem >= WIN_SCORE) endGame("Them 💀")
  }

  const endGame = (winningTeam: string) => {
    setWinTeam(winningTeam)
    setShowEndGame(true)
  }

  const revertLastRound = () => {
    if (rounds.length === 0) return
    const updatedRounds = [...rounds]
    const last = updatedRounds.pop()
    setRounds(updatedRounds)
    setYouPoints((prev) => prev - (last.you.points || 0))
    setThemPoints((prev) => prev - (last.them.points || 0))
    setWinTeam("")
  }

  const confirmGaid = (team: "you" | "them") => {
    const baseTotal = gameType === "Sun" ? 130 : 162
    const totalBonus = totalMashareaAbnat(youInput) + totalMashareaAbnat(themInput)
    const totalRoundAbnat = Math.floor(baseTotal + totalBonus)
    const totalPts = Math.floor(calculatePoints(totalRoundAbnat, gameType))

    const gaidRound =
      team === "you"
        ? {
            type: gameType,
            gaid: true,
            you: {
              points: 0,
              abnat: 0,
              masharea: youInput.masharea,
            },
            them: {
              points: totalPts,
              abnat: totalRoundAbnat,
              masharea: themInput.masharea,
            },
          }
        : {
            type: gameType,
            gaid: true,
            you: {
              points: totalPts,
              abnat: totalRoundAbnat,
              masharea: youInput.masharea,
            },
            them: {
              points: 0,
              abnat: 0,
              masharea: themInput.masharea,
            },
          }

    addRound(gaidRound)
    setShowGaidConfirm(null)
  }

  const formatMasharea = (m: any) => {
    const keys = Object.keys(m || {})
    if (!keys.length) return "-"
    return keys.map((k) => `${k}×${m[k]}`).join(", ")
  }

  return (
    <View style={[GlobalStyles.container, { flex: 1, backgroundColor: "#000", justifyContent: "center" }]}>
      {/* Scoreboard */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20 }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "#fff", fontSize: 36, fontWeight: "bold" }}>You ⭐</Text>
          <Text style={{ color: "#fff", fontSize: 54, fontWeight: "bold" }}>{youPoints}</Text>
        </View>
  
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: "#fff", fontSize: 36, fontWeight: "bold" }}>Them 💀</Text>
          <Text style={{ color: "#fff", fontSize: 54, fontWeight: "bold" }}>{themPoints}</Text>
        </View>
      </View>
  
      {/* Win Text */}
      {winTeam !== "" && (
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 10 }}>
          <Text style={{ color: "#00FF88", fontSize: 22, textAlign: "center", fontWeight: "700", marginRight: 10 }}>
            {winTeam} Wins! 🎉
          </Text>
          <Pressable
            onPress={() => setShowEndGame(true)}
            style={{
              backgroundColor: "#2D3748",
              borderRadius: 10,
              paddingVertical: 8,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesome name="arrow-circle-up" size={18} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>View Details</Text>
          </Pressable>
        </View>
      )}
  
      {/* Advanced Settings */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, marginTop: 4 }}>
        <View style={{ width: 150, justifyContent: 'center', borderRadius: 50, padding: 15, marginHorizontal: 0, backgroundColor: "#00D9FF", flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: "#000", fontSize: 20, fontWeight: "800" }}>Pro</Text>
          <Checkbox
            status={advancedSettings ? "checked" : "unchecked"}
            onPress={() => setAdvancedSettings(!advancedSettings)}
            color="#7C3AED"
          />
        </View>
        <Pressable style={{ width: 150, justifyContent: 'center', backgroundColor: "#00D9FF", borderRadius: 50, padding: 18, marginHorizontal: 10 }} onPress={handleAutoCalculate}>
          <Text style={{ color: "#000", fontSize: 20, fontWeight: "800" }}>Calculate⚡</Text>
        </Pressable>
      </View>
  
      {/* Error messages */}
      {error !== "" && <Text style={[GlobalStyles.errorText, { fontSize: 12, textAlign: "center" }]}>{error}</Text>}

      {/* Game Type + Auto Calculate */}
      {advancedSettings &&
        <View style={[GlobalStyles.row, { justifyContent: "center", marginVertical: 6 }]}>
          <View style={{ flexDirection: "row" }}>
            <Pressable
              key={"Sun"}
              style={[GlobalStyles.option, { marginHorizontal: 0, padding: 6, borderBottomRightRadius: 0, borderTopRightRadius: 0 }, gameType === "Sun" && GlobalStyles.selected]}
              onPress={() => setGameType("Sun")}
            >
              <Text style={[GlobalStyles.h2, { fontSize: 14 }]}>Sun</Text>
            </Pressable>
            <Pressable
              key={"Hukum"}
              style={[GlobalStyles.option, { marginHorizontal: 0, padding: 6, borderBottomLeftRadius: 0, borderTopLeftRadius: 0 }, gameType === "Hukum" && GlobalStyles.selected]}
              onPress={() => setGameType("Hukum")}
            >
              <Text style={[GlobalStyles.h2, { fontSize: 14 }]}>Hukum</Text>
            </Pressable>
          </View>
        </View>
      }
  
      {/* Input Section */}
      <View style={[GlobalStyles.inputSection, { marginVertical: 10 }]}>
        {/* Header */}
        <View style={[GlobalStyles.row, { justifyContent: "space-around", marginBottom: 4 }]}>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>You ⭐</Text>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Them 💀</Text>
        </View>
  
        {/* Points Row */}
        <View style={[GlobalStyles.row, { justifyContent: "space-around", alignItems: "center" }]}>
          <TextInput
            style={[GlobalStyles.input, { width: 70, fontSize: 14 }]}
            placeholder="Pts"
            placeholderTextColor="#4A5568"
            keyboardType="numeric"
            value={youInput.points}
            onChangeText={(text) => {
              setYouLastEdited("points")
              setYouInput((prev) => ({ ...prev, points: text }))
            }}
          />
          <TextInput
            style={[GlobalStyles.input, { width: 70, fontSize: 14 }]}
            placeholder="Pts"
            placeholderTextColor="#4A5568"
            keyboardType="numeric"
            value={themInput.points}
            onChangeText={(text) => {
              setThemLastEdited("points")
              setThemInput((prev) => ({ ...prev, points: text }))
            }}
          />
        </View>
  
        {/* Abnat Row */}
        <View style={[GlobalStyles.row, { justifyContent: "space-around", alignItems: "center", marginTop: 10 }]}>
          <TextInput
            style={[GlobalStyles.input, { width: 70, fontSize: 14 }]}
            placeholder="Abnat"
            placeholderTextColor="#4A5568"
            keyboardType="numeric"
            value={youInput.abnat}
            onChangeText={(text) => {
              setYouLastEdited("abnat")
              setYouInput((prev) => ({ ...prev, abnat: text }))
            }}
          />
          <TextInput
            style={[GlobalStyles.input, { width: 70, fontSize: 14 }]}
            placeholder="Abnat"
            placeholderTextColor="#4A5568"
            keyboardType="numeric"
            value={themInput.abnat}
            onChangeText={(text) => {
              setThemLastEdited("abnat")
              setThemInput((prev) => ({ ...prev, abnat: text }))
            }}
          />
        </View>
  
        {/* Advanced Buttons */}
        {advancedSettings && (
          <View style={[GlobalStyles.row, { justifyContent: "space-around", alignItems: "center", marginTop: 12 }]}>
            <Pressable onPress={() => setShowGaidConfirm("you")} style={[GlobalStyles.actionButton, { width: 100, backgroundColor: "#FF4757", padding: 10, borderRadius: 8 }]}>
              <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>Gaid!</Text>
            </Pressable>
            <Pressable onPress={openMasharea} style={[GlobalStyles.actionButton, { width: 100, backgroundColor: "#7C3AED", padding: 10, borderRadius: 8 }]}>
              <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>Masharea</Text>
            </Pressable>
            <Pressable onPress={() => setShowGaidConfirm("them")} style={[GlobalStyles.actionButton, { width: 100, backgroundColor: "#FF4757", padding: 10, borderRadius: 8 }]}>
              <Text style={{ color: "white", fontSize: 14, fontWeight: "bold" }}>Gaid!</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Big Action Buttons */}
      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginVertical: 20 }}>
        <Pressable style={{ borderRadius: 50, padding: 18, marginHorizontal: 10 }} onPress={revertLastRound}>
          <Text style={{ color: "#fff", fontSize: 35, fontWeight: "bold" }}>↩</Text>
        </Pressable>
  
        <Pressable style={{ backgroundColor: "#fff", borderRadius: 80, paddingVertical: 20, paddingHorizontal: 40 }} onPress={addRound}>
          <Text style={{ color: "#000", fontSize: 20, fontWeight: "800" }}>Add</Text>
        </Pressable>
      </View>
  
      {/* Rounds Table */}
      <ScrollView style={[GlobalStyles.tableContainer, { flex: 1, marginTop: 10 }]}>
        {rounds.map((r, i) => (
          <View key={i} style={[GlobalStyles.tableRow, r.gaid && GlobalStyles.gaidRow]}>
            <Text style={[GlobalStyles.tableText, { flex: 1 }]}>{r.type}</Text>
            <Text style={[GlobalStyles.tableText, { flex: 1 }]}>{r.you.points}</Text>
            <Text style={[GlobalStyles.tableText, { flex: 1 }]}>{r.them.points}</Text>
            <Text style={[GlobalStyles.tableText, { flex: 2 }]}>{formatMasharea(r.you.masharea)}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Gaid Confirmation Modal */}
      <Modal visible={!!showGaidConfirm} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#1A1F3A",
              padding: 24,
              borderRadius: 20,
              width: "85%",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#FF4757",
            }}
          >
            <Text style={[GlobalStyles.h1, { marginBottom: 16, color: "#FF4757", fontSize: 18 }]}>
              ⚠️ Gaid Confirmation
            </Text>
            <Text style={{ color: "#E0E0E0", textAlign: "center", marginBottom: 20, fontSize: 16 }}>
              Are you sure you want to Gaid {showGaidConfirm === "you" ? "You ⭐" : "Them 💀"}?{"\n"}All points will go
              to the other team!
            </Text>
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <Pressable
                style={[GlobalStyles.buttonDanger, { width: 120, marginRight: 12 }]}
                onPress={() => confirmGaid(showGaidConfirm!)}
              >
                <Text style={GlobalStyles.buttonText}>Yes, Gaid!</Text>
              </Pressable>
              <Pressable
                style={[GlobalStyles.buttonSecondary, { width: 120 }]}
                onPress={() => setShowGaidConfirm(null)}
              >
                <Text style={GlobalStyles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
  
      {/* === MASHAREA MODAL (NEW TABBED DESIGN) === */}
      <Modal
        visible={showMasharea}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMasharea(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowMasharea(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.85)",
              justifyContent: "center",
              alignItems: "center",
              padding: 12,
            }}
          >
            {/* Inner modal card */}
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: "#1A1F3A",
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: "#7C3AED",
                  width: "95%",
                  maxWidth: 400,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginBottom: 10,
                  }}
                >
                  <Text style={[GlobalStyles.h1, { color: "#FFD700" }]}>Mashroo</Text>
                  <Text style={[GlobalStyles.h1, { color: "#FFD700" }]}>You ⭐</Text>
                  <Text style={[GlobalStyles.h1, { color: "#FFD700" }]}>Them 💀</Text>
                </View>

                {/* Masharea Rows */}
                {Object.keys(mashareaTypes)
                  .filter((m) => (gameType === "Sun" ? m !== "Baloot" : true))
                  .map((key) => (
                    <View
                      key={key}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginVertical: 8,
                      }}
                    >
                      {/* Masharea name + image */}
                      <View style={{ flex: 1, alignItems: "center" }}>
                        <Image
                          source={mashareaImages[key]}
                          style={{ width: 50, height: 50, marginBottom: 4 }}
                          resizeMode="contain"
                        />
                        <Text
                          style={{
                            color: "#FFD700",
                            textAlign: "center",
                            fontWeight: "600",
                            fontSize: 20,
                          }}
                        >
                          {key}
                        </Text>
                      </View>

                      {/* You controls */}
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Pressable style={{ width: 20 }} onPress={() => modifyMasharea("you", key, +1)}>
                          <Text style={{ color: "limegreen", fontSize: 25 }}>+</Text>
                        </Pressable>

                        <Text
                          style={{
                            color: "white",
                            marginHorizontal: 6,
                            fontWeight: "bold",
                            fontSize: 25,
                          }}
                        >
                          {youInput.masharea[key] || 0}
                        </Text>

                        <Pressable style={{ width: 20, alignItems: "center" }} onPress={() => modifyMasharea("you", key, -1)}>
                          <Text style={{ color: "#FF4757", fontSize: 25 }}>–</Text>
                        </Pressable>
                      </View>

                      {/* Them controls */}
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Pressable style={{ width: 20 }} onPress={() => modifyMasharea("them", key, +1)}>
                          <Text style={{ color: "limegreen", fontSize: 25 }}>+</Text>
                        </Pressable>

                        <Text
                          style={{
                            color: "white",
                            marginHorizontal: 6,
                            fontWeight: "bold",
                            fontSize: 25,
                          }}
                        >
                          {themInput.masharea[key] || 0}
                        </Text>

                        <Pressable style={{ width: 20, alignItems: "center" }} onPress={() => modifyMasharea("them", key, -1)}>
                          <Text style={{ color: "#FF4757", fontSize: 25 }}>–</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}

                {/* Footer buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 12,
                  }}
                >
                  <Pressable
                    style={[
                      GlobalStyles.button,
                      { flex: 1, marginRight: 6, backgroundColor: "#00D9FF" },
                    ]}
                    onPress={confirmMasharea}
                  >
                    <Text style={GlobalStyles.buttonText}>✓</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      GlobalStyles.buttonSecondary,
                      { flex: 1, marginLeft: 6, backgroundColor: "#444" },
                    ]}
                    onPress={() => setShowMasharea(false)}
                  >
                    <Text style={GlobalStyles.buttonText}>✗</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
  
      {/* === END GAME MODAL === */}
      {/* End Game Modal */}
      <Modal
        visible={showEndGame}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndGame(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEndGame(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.85)",
              justifyContent: "center",
              alignItems: "center",
              padding: 12,
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: "#1A1F3A",
                  borderRadius: 18,
                  borderWidth: 2,
                  borderColor: "#7C3AED",
                  width: "90%",
                  maxWidth: 420,
                  maxHeight: "85%",
                  padding: 16,
                  alignItems: "center",
                }}
              >
                {/* 🏆 Winning message */}
                <Text
                  style={{
                    color: "#00FF88",
                    fontSize: 22,
                    fontWeight: "bold",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  {winTeam} Wins! 🎉
                </Text>

                {/* Divider */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#333",
                    width: "100%",
                    marginVertical: 6,
                  }}
                />

                {/* 📋 Rounds Table (scrollable if >5) */}
                <View
                  style={{
                    backgroundColor: "#10142A",
                    borderRadius: 10,
                    width: "100%",
                    paddingVertical: 8,
                    maxHeight: 220,
                    marginBottom: 10,
                  }}
                >
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        borderBottomColor: "#333",
                        borderBottomWidth: 1,
                        paddingVertical: 4,
                      }}
                    >
                      <Text style={{ color: "#FFD700", flex: 1, textAlign: "center", fontWeight: "600" }}>Type</Text>
                      <Text style={{ color: "#FFD700", flex: 1, textAlign: "center", fontWeight: "600" }}>You ⭐</Text>
                      <Text style={{ color: "#FFD700", flex: 1, textAlign: "center", fontWeight: "600" }}>Them 💀</Text>
                    </View>

                    {rounds.map((r, i) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-around",
                          borderBottomColor: "#222",
                          borderBottomWidth: 1,
                          paddingVertical: 4,
                        }}
                      >
                        <Text style={{ color: "#E0E0E0", flex: 1, textAlign: "center", fontSize: 12 }}>{r.type}</Text>
                        <Text style={{ color: "#E0E0E0", flex: 1, textAlign: "center", fontSize: 12 }}>{r.you.points}</Text>
                        <Text style={{ color: "#E0E0E0", flex: 1, textAlign: "center", fontSize: 12 }}>{r.them.points}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Divider */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#333",
                    width: "100%",
                    marginVertical: 6,
                  }}
                />

                {/* 📊 Counters */}
                {(() => {
                  const totalGaids = rounds.filter((r) => r.gaid).length
                  const totalHukum = rounds.filter((r) => r.type === "Hukum").length
                  const totalSun = rounds.filter((r) => r.type === "Sun").length
                  const totalRounds = rounds.length

                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        width: "100%",
                        marginBottom: 14,
                      }}
                    >
                      <View style={{ alignItems: "center" }}>
                        <Text style={{ color: "#00FF88", fontWeight: "600", fontSize: 14 }}>Rounds</Text>
                        <Text style={{ color: "#FFF", fontSize: 14 }}>{totalRounds}</Text>
                      </View>
                      <View style={{ alignItems: "center" }}>
                        <Text style={{ color: "#00D9FF", fontWeight: "600", fontSize: 14 }}>Hukum</Text>
                        <Text style={{ color: "#FFF", fontSize: 14 }}>{totalHukum}</Text>
                      </View>
                      <View style={{ alignItems: "center" }}>
                        <Text style={{ color: "#FFD700", fontWeight: "600", fontSize: 14 }}>Sun</Text>
                        <Text style={{ color: "#FFF", fontSize: 14 }}>{totalSun}</Text>
                      </View>
                      <View style={{ alignItems: "center" }}>
                        <Text style={{ color: "#FF4757", fontWeight: "600", fontSize: 14 }}>Gaid</Text>
                        <Text style={{ color: "#FFF", fontSize: 14 }}>{totalGaids}</Text>
                      </View>
                    </View>
                  )
                })()}

                {/* Buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Pressable
                    style={[
                      GlobalStyles.buttonDanger,
                      {
                        flex: 1,
                        marginRight: 8,
                        backgroundColor: "#FF4757",
                      },
                    ]}
                    onPress={() => {
                      setRounds([])
                      setYouPoints(0)
                      setThemPoints(0)
                      setWinTeam("")
                      setShowEndGame(false)
                    }}
                  >
                    <Text style={[GlobalStyles.buttonText, { fontSize: 14 }]}><FontAwesome name="arrow-circle-up" size={16} color="#FFFFFF" style={{ marginRight: 5 }} /> Restart</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      GlobalStyles.button,
                      {
                        flex: 1,
                        marginLeft: 8,
                        backgroundColor: "#00D9FF",
                      },
                    ]}
                    onPress={() => setShowEndGame(false)}
                  >
                    <Text style={[GlobalStyles.buttonText, { fontSize: 14 }]}>➡ Continue</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Keep your same logic & structure — already well-styled */}
    </View>
  )
  
}
