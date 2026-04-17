import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Shield, Lock, Fingerprint, ArrowRight } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { BlurView } from 'expo-blur';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

const { width, height } = Dimensions.get('window');

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [status, setStatus] = useState('STANDBY');

  const onAuthenticate = async () => {
    setStatus('VERIFYING');
    try {
      const results = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Initialize Sanctuary Handshake',
        fallbackLabel: 'Enter Access Key',
      });

      if (results.success) {
        setAuthenticated(true);
        setStatus('ACTIVE');
      } else {
        setStatus('FAILED');
      }
    } catch (e) {
      console.error(e);
      setStatus('ERROR');
    }
  };

  return (
    <StyledView className="flex-1 bg-black items-center justify-center">
      <StatusBar style="light" />
      
      {/* Background Glow */}
      <View style={styles.glow} />

      <SafeAreaView className="w-full items-center px-12">
        <StyledView className="mb-16 items-center">
          <StyledView className="h-24 w-24 rounded-full border-[0.5px] border-primary/20 items-center justify-center bg-black">
            <Shield size={40} color="#00FFAA" strokeWidth={1} />
          </StyledView>
          <StyledText className="mt-8 text-3xl font-light tracking-[0.5em] text-white uppercase">pushing</StyledText>
          <StyledText className="text-3xl font-bold tracking-[0.5em] text-primary uppercase">Security</StyledText>
        </StyledView>

        {!authenticated ? (
          <StyledView className="w-full gap-8">
            <StyledText className="text-center text-[10px] text-white/30 uppercase tracking-[0.5em] mb-8 italic">
              Sovereign Mobile Key // V1.0
            </StyledText>

            <StyledTouchableOpacity 
              onPress={onAuthenticate}
              activeOpacity={0.8}
              className="w-full overflow-hidden rounded-3xl"
            >
              <BlurView intensity={20} tint="light" style={styles.buttonBlur}>
                <StyledView className="flex-row items-center justify-between px-8 py-6 border border-white/10 rounded-3xl">
                  <StyledView className="flex-row items-center gap-4">
                    <Fingerprint size={20} color="#00FFAA" />
                    <StyledText className="text-white font-bold uppercase tracking-widest text-xs">
                      {status === 'STANDBY' ? 'Initialize_Handshake' : status === 'VERIFYING' ? 'Authenticating...' : 'Retry_Auth'}
                    </StyledText>
                  </StyledView>
                  <ArrowRight size={16} color="#00FFAA" />
                </StyledView>
              </BlurView>
            </StyledTouchableOpacity>

            <StyledView className="items-center opacity-20">
               <StyledText className="text-[8px] font-mono text-white uppercase tracking-widest">
                 Node // 100.102.41.1
               </StyledText>
            </StyledView>
          </StyledView>
        ) : (
          <StyledView className="items-center">
             <StyledView className="h-32 w-32 rounded-full border-2 border-primary items-center justify-center">
               <Lock size={48} color="#00FFAA" />
             </StyledView>
             <StyledText className="mt-12 text-white font-bold uppercase tracking-[0.8em] text-center">
               SESSION_ACTIVE
             </StyledText>
             <StyledText className="mt-4 text-white/40 text-[9px] uppercase tracking-[0.4em] text-center">
               Sovereign Hub Handshake Verified
             </StyledText>
          </StyledView>
        )}
      </SafeAreaView>

      {/* Footer Branding */}
      <StyledView className="absolute bottom-16 opacity-10">
         <StyledText className="text-[8px] font-bold uppercase tracking-[0.6em] text-white">
           MiniO Sanctuary // P-V3
         </StyledText>
      </StyledView>
    </StyledView>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: height / 4,
    left: width / 4,
    width: width / 2,
    height: width / 2,
    backgroundColor: '#00FFAA',
    borderRadius: 999,
    opacity: 0.05,
    transform: [{ scale: 2 }],
    shadowColor: '#00FFAA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
  },
  buttonBlur: {
    width: '100%',
  }
});
