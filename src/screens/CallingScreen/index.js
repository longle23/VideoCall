import { Pressable, StyleSheet, Text, View, PermissionsAndroid, Alert, Platform } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'

import CallActionBox from '../../components/CallActionBox';
import Ionicons from 'react-native-vector-icons/Ionicons'

import { useNavigation, useRoute } from '@react-navigation/native';
import { Voximplant } from 'react-native-voximplant'

const permissions = [
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    PermissionsAndroid.PERMISSIONS.CAMERA,
];

const CallingScreen = () => {
    const [permissionGrandted, setPermissionGranted] = useState(false);
    const [callStatus, setCallStatus] = useState('Initializing...');

    const navigation = useNavigation();
    const route = useRoute()

    const { user, call: incomingCall, isIncomingCall } = route?.params;

    const voximplant = Voximplant.getInstance();

    const call = useRef(incomingCall);

    const goBack = () => {
        navigation.pop()
    }

    useEffect(() => {
        const getPermissions = async () => {
            const granted = await PermissionsAndroid.requestMultiple(permissions);
            const recordAudioGranted =
                granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] = 'granted';
            const cameraGranted =
                granted[PermissionsAndroid.PERMISSIONS.CAMERA] = 'granted';
            if (!cameraGranted | !recordAudioGranted) {
                Alert.alert('Permissions not granted');
            } else {
                setPermissionGranted(true);
            }
        }

        if (Platform.OS === 'android') {
            getPermissions();
        } else {
            setPermissionGranted(true);
        }
    }, [])

    useEffect(() => {
        if (!permissionGrandted) {
            return;
        }

        const callSettings = {
            video: {
                sendVideo: true,
                receiveVideo: true,
            },
        };

        const makeCall = async () => {
            call.current = await voximplant.call(user.user_name, callSettings);
            subscribeToCallEvents();
        }

        const subscribeToCallEvents = () => {
            // Call Failed
            call.current.on(Voximplant.CallEvents.Failed, callEvent => {
                showError(callEvent.reason);
            });

            // Call Progress started
            call.current.on(Voximplant.CallEvents.ProgressToneStart, callEvent => {
                setCallStatus('Calling...');
            });

            // Call Connected
            call.current.on(Voximplant.CallEvents.Connected, callEvent => {
                setCallStatus('Connected');
            });

            // Call Disconnected
            call.current.on(Voximplant.CallEvents.Disconnected, callEvent => {
                navigation.navigate('Contacts');
            });
        }

        const showError = reason => {
            Alert.alert("Call failed", `Reason: ${reason}`, [
                {
                    text: 'Ok',
                    onPress: navigation.navigate('Contacts'),
                },
            ]);
        }

        makeCall();

        return () => {
            call.current.off(Voximplant.CallEvents.Failed);
            call.current.off(Voximplant.CallEvents.ProgressToneStart);
            call.current.off(Voximplant.CallEvents.Connected);
            call.current.off(Voximplant.CallEvents.Disconnected);
        }
    }, [permissionGrandted])

    const onHangupPress = () => {
        call.current.hangup();
    }

    return (
        <View style={styles.page}>
            <Pressable onPress={goBack} style={styles.backButton}>
                <Ionicons name='chevron-back' size={25} color={'white'} />
            </Pressable>

            <View style={styles.cameraPreview}>
                <Text style={styles.name}>{user?.user_display_name}</Text>

                <Text style={styles.phoneNumber}>{callStatus}</Text>
            </View>

            <CallActionBox onHangupPress={onHangupPress} />
        </View>
    )
}

export default CallingScreen

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#7b4e80',
        height: '100%'
    },
    cameraPreview: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 10
    },
    name: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 50,
        marginBottom: 15
    },
    phoneNumber: {
        fontSize: 20,
        color: 'white',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 10,
    },
})