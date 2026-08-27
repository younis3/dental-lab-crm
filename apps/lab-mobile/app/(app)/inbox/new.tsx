import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { radius, spacing, type as typeScale } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { startConversation } from '@/store/chat-store';
import { useLanguage } from '@/store/language-store';

export default function ComposeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const [name, setName] = useState('');
  const [clinic, setClinic] = useState('');
  const [message, setMessage] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const send = () => {
    if (!name.trim() || !message.trim()) {
      setShowErrors(true);
      return;
    }
    const id = startConversation({
      name,
      clinic,
      firstMessage: message,
    });
    router.replace({ pathname: '/inbox/[id]', params: { id } });
  };

  return (
    <Screen
      withTabBarInset={false}
      header={
        <ScreenHeader title={ui.composeTitle} leading={<BackButton />} showMenu={false} />
      }>
      <View style={styles.group}>
        <Field
          size="sm"
          label={ui.composeRecipient}
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (showErrors) setShowErrors(false);
          }}
          icon="person-outline"
          placeholder={ui.composeRecipientPlaceholder}
          invalid={showErrors && !name.trim()}
        />
        <Field
          size="sm"
          label={ui.composeClinic}
          value={clinic}
          onChangeText={setClinic}
          icon="business-outline"
          placeholder={ui.composeClinicPlaceholder}
        />
      </View>

      <View style={styles.group}>
        <Text variant="caption" tone="muted">
          {ui.composeMessage}
        </Text>
        <View
          style={[
            styles.messageBox,
            {
              backgroundColor: theme.color.surfaceMuted,
              borderColor: showErrors && !message.trim() ? theme.color.danger : theme.color.border,
            },
          ]}>
          <TextInput
            value={message}
            onChangeText={(value) => {
              setMessage(value);
              if (showErrors) setShowErrors(false);
            }}
            placeholder={ui.composeMessagePlaceholder}
            placeholderTextColor={theme.color.textFaint}
            multiline
            style={[
              styles.messageInput,
              { color: theme.color.text, textAlign: isRtl ? 'right' : 'left' },
            ]}
          />
        </View>
      </View>

      <Button label={ui.composeSend} icon="send" onPress={send} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.md },
  messageBox: {
    minHeight: 140,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  messageInput: { ...typeScale.body, flex: 1, textAlignVertical: 'top', paddingVertical: 0 },
});
