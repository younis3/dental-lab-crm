import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BackButton } from '@/components/ui/back-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Icon, type IconName } from '@/components/ui/icon';
import { OtpInput } from '@/components/ui/otp-input';
import { Badge, useToneColors, withAlpha, type Tone } from '@/components/ui/pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Text } from '@/components/ui/text';
import { radius, spacing } from '@/constants/design';
import { useTheme } from '@/hooks/use-theme';
import { interpolate, type UiStrings } from '@/lib/i18n';
import { row } from '@/lib/rtl';
import { usePermissions } from '@/store/auth-store';
import {
  INTEGRATIONS,
  integrationStatus,
  saveIntegration,
  useIntegrations,
  type IntegrationId,
  type IntegrationMeta,
  type IntegrationStatus,
} from '@/store/integrations-store';
import { useLanguage } from '@/store/language-store';

const OTP_LENGTH = 4;

export default function IntegrationsScreen() {
  const { ui } = useLanguage();
  const { can } = usePermissions();
  const state = useIntegrations();
  const [editingId, setEditingId] = useState<IntegrationId | null>(null);

  if (!can('manageStaff')) {
    return <Redirect href="/" />;
  }

  return (
    <Screen
      withTabBarInset={false}
      header={
        <ScreenHeader
          title={ui.integrationsTitle}
          subtitle={ui.integrationsSubtitle}
          leading={<BackButton />}
          showMenu={false}
        />
      }>
      <Text variant="caption" tone="faint">
        {ui.integrationsIntro}
      </Text>

      <View style={styles.list}>
        {INTEGRATIONS.map((meta, index) => (
          <Animated.View
            key={meta.id}
            entering={FadeInDown.delay(Math.min(index * 60, 240)).duration(360)}>
            <ProviderCard
              meta={meta}
              status={integrationStatus(meta.id, state[meta.id])}
              onPress={() => setEditingId(meta.id)}
            />
          </Animated.View>
        ))}
      </View>

      <EditorSheet editingId={editingId} onClose={() => setEditingId(null)} />
    </Screen>
  );
}

const STATUS_META: Record<
  IntegrationStatus,
  { tone: Tone; icon: IconName; labelKey: keyof UiStrings }
> = {
  active: { tone: 'success', icon: 'checkmark-circle', labelKey: 'integrationActive' },
  disconnected: { tone: 'danger', icon: 'alert-circle', labelKey: 'integrationDisconnected' },
  off: { tone: 'neutral', icon: 'ellipse-outline', labelKey: 'integrationOff' },
};

function ProviderCard({
  meta,
  status,
  onPress,
}: {
  meta: IntegrationMeta;
  status: IntegrationStatus;
  onPress: () => void;
}) {
  const { isRtl, ui } = useLanguage();
  const { fg, bg } = useToneColors(meta.tone);
  const statusMeta = STATUS_META[status];

  return (
    <PressableScale scaleTo={0.98} onPress={onPress} accessibilityRole="button" accessibilityLabel={ui[meta.labelKey]}>
      <Card style={styles.card}>
        <View style={[styles.cardTop, row(isRtl)]}>
          <View style={[styles.cardIcon, { backgroundColor: bg }]}>
            <Icon name={meta.icon} size={20} color={fg} />
          </View>
          <View style={styles.flex}>
            <Text variant="subheading" numberOfLines={1}>
              {ui[meta.labelKey]}
            </Text>
            <Text variant="caption" tone="faint" numberOfLines={2}>
              {ui[meta.hintKey]}
            </Text>
          </View>
          <Badge
            label={ui[statusMeta.labelKey]}
            tone={statusMeta.tone}
            icon={statusMeta.icon}
          />
        </View>
      </Card>
    </PressableScale>
  );
}

function EditorSheet({
  editingId,
  onClose,
}: {
  editingId: IntegrationId | null;
  onClose: () => void;
}) {
  const theme = useTheme();
  const { isRtl, ui } = useLanguage();
  const state = useIntegrations();
  const meta = INTEGRATIONS.find((item) => item.id === editingId);

  const [values, setValues] = useState<Record<string, string>>({});
  const [openKey, setOpenKey] = useState<IntegrationId | null>(null);
  const [mode, setMode] = useState<'edit' | 'otp'>('edit');
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);

  // Reseed the draft from the store each time a different provider is opened.
  if (editingId !== openKey) {
    setOpenKey(editingId);
    setMode('edit');
    setOtpInput('');
    setOtpError(false);
    if (editingId) {
      setValues({ ...state[editingId].values });
    }
  }

  // Keys only change through a fresh 4-digit confirmation, so an unchanged draft
  // just closes without a challenge.
  const changed = Boolean(
    editingId &&
      meta?.fields.some(
        (field) => (values[field.key] ?? '').trim() !== (state[editingId].values[field.key] ?? '')
      )
  );

  const requestSave = () => {
    if (!editingId) return;
    if (!changed) {
      onClose();
      return;
    }
    setOtpCode('1234');
    setOtpInput('');
    setOtpError(false);
    setMode('otp');
  };

  const confirmSave = (candidate = otpInput) => {
    if (!editingId) return;
    if (candidate.trim() !== otpCode) {
      setOtpError(true);
      setOtpInput('');
      return;
    }
    saveIntegration(editingId, { enabled: true, values });
    onClose();
  };

  const handleOtpChange = (next: string) => {
    setOtpInput(next);
    if (otpError) setOtpError(false);
    if (next.length === OTP_LENGTH) confirmSave(next);
  };

  const footer =
    mode === 'otp' ? (
      <>
        <View style={styles.flex}>
          <Button
            size="md"
            label={ui.integrationConfirm}
            onPress={() => confirmSave()}
            disabled={otpInput.length !== OTP_LENGTH}
          />
        </View>
        <View style={styles.flex}>
          <Button size="md" variant="secondary" label={ui.actionCancel} onPress={onClose} />
        </View>
      </>
    ) : (
      <>
        <View style={styles.flex}>
          <Button size="md" label={ui.integrationSave} onPress={requestSave} />
        </View>
        <View style={styles.flex}>
          <Button size="md" variant="secondary" label={ui.actionCancel} onPress={onClose} />
        </View>
      </>
    );

  return (
    <BottomSheet
      visible={Boolean(editingId)}
      onClose={onClose}
      title={mode === 'otp' ? ui.integrationOtpTitle : meta ? ui[meta.labelKey] : ''}
      footer={footer}>
      {meta && mode === 'edit' ? (
        <>
          {meta.fields.map((field) => (
            <Field
              key={field.key}
              size="sm"
              ltr
              label={ui[field.labelKey]}
              value={values[field.key] ?? ''}
              onChangeText={(value) => setValues((prev) => ({ ...prev, [field.key]: value }))}
              icon={field.secret ? 'key-outline' : 'link-outline'}
              placeholder={ui[field.placeholderKey]}
              secure={field.secret}
              toggleLabels={{ show: ui.integrationShowValue, hide: ui.integrationHideValue }}
            />
          ))}
        </>
      ) : null}

      {meta && mode === 'otp' ? (
        <View style={styles.otpBody}>
          <Text variant="caption" tone="muted">
            {ui.integrationOtpLabel}
          </Text>

          <OtpInput
            size="sm"
            value={otpInput}
            onChangeText={handleOtpChange}
            length={OTP_LENGTH}
            autoFocus
            invalid={otpError}
            accessibilityLabel={ui.integrationOtpLabel}
          />

          {otpError ? (
            <View
              style={[
                styles.otpError,
                row(isRtl),
                { backgroundColor: withAlpha(theme.color.danger, 0.1) },
              ]}>
              <Icon name="alert-circle" size={14} color={theme.color.danger} />
              <Text variant="caption" tone="danger" style={styles.flex}>
                {ui.integrationOtpError}
              </Text>
            </View>
          ) : null}

          <View style={[styles.otpHint, row(isRtl), { backgroundColor: theme.color.brandSoft }]}>
            <Icon name="information-circle-outline" size={14} color={theme.color.brand} />
            <Text variant="caption" tone="brand">
              {interpolate(ui.integrationOtpHint, { code: otpCode })}
            </Text>
          </View>
        </View>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: spacing.md },
  card: { gap: spacing.md },
  cardTop: { alignItems: 'center', gap: spacing.md },
  cardIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  otpBody: { gap: spacing.md },
  otpError: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  otpHint: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
});
