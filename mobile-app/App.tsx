import React, { useState } from "react";
import { Button, Platform, SafeAreaView, ScrollView, Text, View, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import PuzzleBoard from "./src/components/PuzzleBoard";
import { createPuzzle, getPuzzle, CreatePuzzleResponse } from "./src/api";
import AuthBar from "./src/components/AuthBar";

export default function App() {
  const [localImage, setLocalImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [difficulty, setDifficulty] = useState(3);
  const [puzzle, setPuzzle] = useState<CreatePuzzleResponse | null>(null);
  const [status, setStatus] = useState<string>("");

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.9, base64: false });
    if (!res.canceled) {
      setLocalImage(res.assets[0]);
    }
  };

  const onCreate = async () => {
    try {
      if (!localImage) return;
      setStatus("Création du puzzle…");
      let blob: Blob;
      if (Platform.OS === "web") {
        const resp = await fetch(localImage.uri);
        blob = await resp.blob();
      } else {
        const resp = await fetch(localImage.uri);
        blob = await resp.blob();
      }
      const created = await createPuzzle(blob, difficulty);
      setPuzzle(created);
      setStatus("Puzzle créé !");
    } catch (e: any) {
      Alert.alert("Erreur", e.message ?? "Impossible de créer le puzzle");
      setStatus("");
    }
  };

  const onLoadShared = async () => {
    const id = prompt("Entrer un puzzle_id à charger:");
    if (!id) return;
    try {
      const p = await getPuzzle(id);
      setPuzzle(p);
      setStatus("Puzzle chargé !");
    } catch {
      Alert.alert("Introuvable", "Ce puzzle_id est introuvable.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0b0b0f" }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: "white", fontSize: 24, fontWeight: "600" }}>Puzzle Image</Text>
          <AuthBar />
        </View>

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Button title="Choisir une image" onPress={pickImage} />
          <Button title="Créer puzzle" onPress={onCreate} disabled={!localImage} />
          <Button title="Charger un puzzle partagé" onPress={onLoadShared} />
        </View>

        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <Text style={{ color: "white" }}>Difficulté:</Text>
          {[3, 4, 5, 6].map((d) => (
            <Button key={d} title={`${d}x${d}`} onPress={() => setDifficulty(d)} color={d === difficulty ? "#3b82f6" : undefined} />
          ))}
        </View>

        {status ? <Text style={{ color: "#9ca3af" }}>{status}</Text> : null}

        {localImage ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: "white" }}>Aperçu:</Text>
            <Image source={{ uri: localImage.uri }} style={{ width: 200, height: 200, borderRadius: 8 }} />
          </View>
        ) : null}

        {puzzle ? (
          <View style={{ gap: 12 }}>
            <Text style={{ color: "white" }}>Puzzle ID: {puzzle.puzzle_id}</Text>
            <Text style={{ color: "#93c5fd" }}>Lien partage: {puzzle.share_url}</Text>
            {/* Utilise Alert.alert pour mobile natif et déclenchement fiable côté PuzzleBoard */}
            <PuzzleBoard tiles={puzzle.tiles} grid={puzzle.difficulty} onSolved={() => Alert.alert("Bravo !", "Puzzle complété 🎉")} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
