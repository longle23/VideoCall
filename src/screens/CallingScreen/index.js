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
    const [localVideoStreamId, setLocalVideoStreamId] = useState('');
    const [remoteVideoStreamId, setRemoteVideoStreamId] = useState('');

    const navigation = useNavigation();
    const route = useRoute()

    const { user, call: incomingCall, isIncomingCall } = route?.params;

    const voximplant = Voximplant.getInstance();

    const call = useRef(incomingCall);
    const endpoint = useRef(null);

    const goBack = () => {
        navigation.pop()
    }

    useEffect(() => {
        const getPermissions = async () => {
            const granted = await PermissionsAndroid.requestMultiple(permissions);
            const recordAudioGranted =
                granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted';
            const cameraGranted =
                granted[PermissionsAndroid.PERMISSIONS.CAMERA] === 'granted';
            if (!cameraGranted || !recordAudioGranted) {
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

        const answerCall = async () => {
            subscribeToCallEvents();
            endpoint.current = call.current.getEndpoints()[0];
            subscribeToEndpointEvent();
            call.current.answer(callSettings);
        };

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

            call.current.on(Voximplant.CallEvents.LocalVideoStreamAdded, callEvent => {
                setLocalVideoStreamId(callEvent.videoStream.id);
            });

            call.current.on(Voximplant.CallEvents.EndpointAdded, callEvent => {
                endpoint.current = callEvent.endpoint;
                subscribeToEndpointEvent();
            });
        }

        const subscribeToEndpointEvent = async () => {
            endpoint.current.on(
                Voximplant.EndpointEvents.RemoteVideoStreamAdded, endpointEvent => {
                    setRemoteVideoStreamId(endpointEvent.videoStream.id);
                },
            );
        };

        const showError = reason => {
            Alert.alert("Call failed", `Reason: ${reason}`, [
                {
                    text: 'Ok',
                    onPress: navigation.navigate('Contacts'),
                },
            ]);
        }

        if (isIncomingCall) {
            answerCall();
        } else {
            makeCall();
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

            <Voximplant.VideoView
                videoStreamId={remoteVideoStreamId}
                style={styles.remoteVideo} />

            <Voximplant.VideoView
                videoStreamId={localVideoStreamId}
                style={styles.localVideo} />

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
    localVideo: {
        width: 100,
        height: 150,
        backgroundColor: '#ffff6e',
        borderRadius: 10,
        position: 'absolute',
        right: 10,
        top: 100,
    },
    remoteVideo: {
        backgroundColor: '#7b4e80',
        borderRadius: 10,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 100,
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