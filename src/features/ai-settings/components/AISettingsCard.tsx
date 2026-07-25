import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, Switch, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Input, InputField, InputSlot } from "@/src/components/ui/input";
import { AppButton, AppCard, AppText } from "@/src/components/shared";
import { ALLOWED_GEMMA_MODELS, type GemmaModel } from "@/src/services/ai";
import { colors } from "@/src/theme";
import {
  getAIConfiguration,
  removeGeminiApiKey,
  setAIEnabled,
  setGeminiApiKey,
  setGemmaModel,
  testGeminiConfiguration,
  type AIConfiguration,
} from "../services/ai-settings.service";

type TestState = {
  tone: "primary" | "secondary" | "error";
  message: string;
} | null;

function modelLabel(model: GemmaModel) {
  return model === "gemma-4-26b-a4b-it" ? "Gemma 4 26B" : "Gemma 4 31B";
}

function statusLabel(config: AIConfiguration | null) {
  if (!config) {
    return "Chargement";
  }
  if (!config.geminiApiKeyConfigured) {
    return "Aucune clé configurée";
  }
  return `Clé enregistrée ${config.geminiApiKeyPreview ?? ""}`.trim();
}

export function AISettingsCard() {
  const [config, setConfig] = useState<AIConfiguration | null>(null);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GemmaModel>("gemma-4-26b-a4b-it");
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testState, setTestState] = useState<TestState>(null);

  const reload = useCallback(async () => {
    const nextConfig = await getAIConfiguration();
    setConfig(nextConfig);
    setSelectedModel(nextConfig.gemmaModel);
    setEnabled(nextConfig.aiEnabled);
  }, []);

  useEffect(() => {
    reload().catch(() => setTestState({ tone: "error", message: "Impossible de charger les paramètres IA." }));
  }, [reload]);

  async function handleSave() {
    setSaving(true);
    setTestState(null);
    try {
      await setAIEnabled(enabled);
      await setGemmaModel(selectedModel);
      if (apiKeyDraft.trim().length > 0) {
        await setGeminiApiKey(apiKeyDraft);
        setApiKeyDraft("");
      }
      await reload();
      setTestState({ tone: "secondary", message: "Paramètres IA enregistrés." });
    } catch {
      setTestState({ tone: "error", message: "Enregistrement impossible." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteKey() {
    setSaving(true);
    setTestState(null);
    try {
      await removeGeminiApiKey();
      setApiKeyDraft("");
      await reload();
      setTestState({ tone: "secondary", message: "Clé Gemini supprimée." });
    } catch {
      setTestState({ tone: "error", message: "Suppression impossible." });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestState({ tone: "secondary", message: "Test de connexion en cours..." });
    try {
      if (apiKeyDraft.trim().length > 0) {
        await setGeminiApiKey(apiKeyDraft);
        setApiKeyDraft("");
      }
      await setAIEnabled(enabled);
      await setGemmaModel(selectedModel);
      const result = await testGeminiConfiguration();
      await reload();
      setTestState({
        tone: result.success ? "secondary" : "error",
        message: result.success ? `${result.message} ${result.latencyMs} ms.` : result.message,
      });
    } catch {
      setTestState({ tone: "error", message: "Test de connexion impossible." });
    } finally {
      setTesting(false);
    }
  }

  function confirmDeleteKey() {
    Alert.alert("Supprimer la clé Gemini", "La clé enregistrée sera supprimée de cet appareil.", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => void handleDeleteKey() },
    ]);
  }

  return (
    <AppCard className="gap-5">
      <View className="gap-1">
        <AppText variant="subtitle">Intelligence artificielle</AppText>
        <AppText variant="caption" tone="secondary">
          {statusLabel(config)}
        </AppText>
      </View>

      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-1">
          <AppText variant="label">{"Activer l'IA"}</AppText>
          <AppText variant="caption" tone="secondary">
            {enabled ? "Active pour les prochains tests" : "Désactivée"}
          </AppText>
        </View>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: colors.border, true: colors.secondary }}
          thumbColor={colors.white}
          accessibilityLabel="Activer l'IA"
        />
      </View>

      <View className="gap-2">
        <AppText variant="label">Clé API Gemini</AppText>
        <Input variant="rounded" size="xl" className="border-[#E8D9C7] bg-[#FFFDF8]">
          <InputField
            value={apiKeyDraft}
            onChangeText={setApiKeyDraft}
            placeholder={config?.geminiApiKeyConfigured ? "Clé enregistrée" : "Coller une clé Gemini"}
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
            className="text-base text-[#2F241F]"
            accessibilityLabel="Clé API Gemini"
          />
          <InputSlot className="px-4" onPress={() => setShowKey((value) => !value)}>
            <FontAwesome5 name={showKey ? "eye-slash" : "eye"} size={16} color={colors.textSecondary} />
          </InputSlot>
        </Input>
      </View>

      <View className="gap-2">
        <AppText variant="label">Modèle</AppText>
        <View className="flex-row gap-2">
          {ALLOWED_GEMMA_MODELS.map((model) => {
            const selected = selectedModel === model;
            return (
              <Pressable
                key={model}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSelectedModel(model)}
                className={[
                  "min-h-[48px] flex-1 items-center justify-center rounded-full border px-3",
                  selected ? "border-[#D94B24] bg-[#D94B24]" : "border-[#E8D9C7] bg-[#FFF7E8]",
                ].join(" ")}
              >
                <AppText variant="label" tone={selected ? "inverse" : "primary"} className="text-center">
                  {modelLabel(model)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {testState ? (
        <AppText variant="caption" tone={testState.tone}>
          {testState.message}
        </AppText>
      ) : null}

      <View className="gap-3">
        <AppButton title="Enregistrer" iconName="save" onPress={handleSave} loading={saving} />
        <AppButton title="Tester la connexion" iconName="bolt" variant="secondary" onPress={handleTest} loading={testing} />
        <AppButton title="Supprimer la clé" iconName="trash-alt" variant="tertiary" onPress={confirmDeleteKey} disabled={!config?.geminiApiKeyConfigured && apiKeyDraft.length === 0} />
      </View>
    </AppCard>
  );
}
