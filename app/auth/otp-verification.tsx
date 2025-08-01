import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter, useLocalSearchParams } from "expo-router";
import { otpService } from "../services/otpService";
import { LinearGradient } from 'expo-linear-gradient';

export default function OTPVerification() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await otpService.verifyOTP(email as string, otpCode);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'OTP verified successfully! You can now reset your password.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/auth/login')
            }
          ]
        );
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError("");

    try {
      const result = await otpService.resendOTP(email as string);
      
      if (result.success) {
        setOtp(["", "", "", "", "", ""]);
        setResendDisabled(true);
        setCountdown(60); // 60 seconds cooldown
        Alert.alert('OTP Resent', result.message);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <LinearGradient
    colors={['#002219', '#008361', '#002219']}
    style={styles.gradientContainer}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
      >
      <Image source={require("../../assets/images/icon.png")} style={styles.logo} />
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {email || "your email"}</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => {
              if (ref) inputRefs.current[idx] = ref;
            }}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={v => handleChange(idx, v)}
          />
        ))}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity 
        style={[styles.verifyButton, loading && styles.verifyButtonDisabled]} 
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.verifyText}>Verify OTP</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={handleResendOTP}
        disabled={resendDisabled || resendLoading}
        style={resendDisabled && styles.resendDisabled}
      >
        {resendLoading ? (
          <ActivityIndicator size="small" color="#4caf50" />
        ) : (
          <Text style={styles.resendText}>
            {resendDisabled 
              ? `Resend in ${countdown}s` 
              : "Didn't receive code? Resend"
            }
          </Text>
        )}
      </TouchableOpacity>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4caf50",
    marginBottom: 24,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  otpInput: {
    width: 40,
    height: 48,
    borderWidth: 1,
    borderColor: "#4caf50",
    borderRadius: 8,
    marginHorizontal: 6,
    fontSize: 24,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  verifyButton: {
    backgroundColor: "#4caf50",
    borderRadius: 8,
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  verifyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  resendText: {
    color: "#4caf50",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#f44336",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  verifyButtonDisabled: {
    backgroundColor: "#ccc",
  },
  resendDisabled: {
    opacity: 0.5,
  },
}); 