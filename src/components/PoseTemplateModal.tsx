import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, BorderRadius } from '../ui/theme';
import {
  HeadlineMedium,
  BodyMedium,
  BodySmall,
  LabelMedium,
  LabelSmall,
} from '../ui/Typography';
import { GlassCard } from '../ui/GlassCard';
import { PrimaryButton } from '../ui/PrimaryButton';
import { POSE_TEMPLATES, PoseTemplate } from '../constants/poseTemplates';

const { width } = Dimensions.get('window');

interface PoseTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PoseTemplate | null) => void;
  selectedTemplateId: string | null;
}

export const PoseTemplateModal: React.FC<PoseTemplateModalProps> = ({
  visible,
  onClose,
  onSelectTemplate,
  selectedTemplateId,
}) => {
  const handleSelect = (template: PoseTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectTemplate(template);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectTemplate(null);
    onClose();
  };

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={30} style={styles.backdrop}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
        
        <Animated.View 
          entering={SlideInUp.springify()}
          style={styles.modalContainer}
        >
          <GlassCard style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <LabelMedium style={styles.headerEmoji}>💡</LabelMedium>
              </View>
              <HeadlineMedium style={styles.title}>
                Şablon Önerisi
              </HeadlineMedium>
              <BodyMedium color="secondary" style={styles.subtitle}>
                Bu fotoğraf tam boy görünmüyor. En iyi sonuçlar için bir şablon seçebilirsin.
              </BodyMedium>
            </View>

            {/* Template Grid */}
            <ScrollView 
              style={styles.templatesScroll}
              contentContainerStyle={styles.templatesGrid}
              showsVerticalScrollIndicator={false}
            >
              {POSE_TEMPLATES.map((template) => (
                <Pressable
                  key={template.id}
                  onPress={() => handleSelect(template)}
                  style={styles.templateWrapper}
                >
                  <GlassCard
                    style={[
                      styles.templateCard,
                      selectedTemplateId === template.id && styles.templateCardSelected,
                    ]}
                  >
                    <View style={styles.templateEmoji}>
                      <LabelMedium style={styles.emoji}>{template.emoji}</LabelMedium>
                    </View>
                    <View style={styles.templateInfo}>
                      <LabelMedium numberOfLines={1}>{template.title}</LabelMedium>
                      <LabelSmall color="tertiary" numberOfLines={1}>
                        {template.description}
                      </LabelSmall>
                    </View>
                    {selectedTemplateId === template.id && (
                      <View style={styles.selectedBadge}>
                        <LabelSmall style={styles.checkIcon}>✓</LabelSmall>
                      </View>
                    )}
                  </GlassCard>
                </Pressable>
              ))}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <Pressable onPress={handleSkip} style={styles.skipButton}>
                <LabelMedium color="secondary">Atla</LabelMedium>
              </Pressable>
              <PrimaryButton
                title="Devam Et"
                onPress={handleConfirm}
                disabled={!selectedTemplateId}
                style={styles.confirmButton}
              />
            </View>
          </GlassCard>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    maxHeight: '85%',
  },
  modal: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: {
    fontSize: 28,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  templatesScroll: {
    maxHeight: 280,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 8,
  },
  templateWrapper: {
    width: (width - Spacing.lg * 2 - Spacing.page * 2 - 12) / 2,
  },
  templateCard: {
    padding: 14,
    gap: 10,
    alignItems: 'center',
    position: 'relative',
  },
  templateCardSelected: {
    borderColor: Colors.accent.primary,
    backgroundColor: 'rgba(181, 255, 31, 0.08)',
  },
  templateEmoji: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  templateInfo: {
    alignItems: 'center',
    gap: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: Colors.dark.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  confirmButton: {
    flex: 1,
  },
});

export default PoseTemplateModal;

