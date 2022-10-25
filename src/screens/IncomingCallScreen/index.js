import { StyleSheet, Text, View, Image, ImageBackground, TextInput, Pressable, Alert } from 'react-native'
import React from 'react'
import bg from '../../../assets/images/ios_bg.png'
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const IncomingCallScreen = () => {

    const onDecline = () => {
        console.warn("onDecline");
    }

    const onAccept = () => {
        console.warn("onAccept");
    }

    return (
        <View style={styles.root}>
            <ImageBackground source={bg} style={styles.bg} resizeMode="cover" >
                <Text style={styles.name}>Long Lee</Text>

                <Text style={styles.phoneNumber}>WhatsApp video...</Text>

                <View style={[styles.row, { marginTop: 'auto' }]}>
                    <View style={styles.iconsContainer}>
                        <MaterialIcons name='alarm' size={30} color='white' />
                        <Text style={styles.iconText}>Remind me</Text>
                    </View>

                    <View style={styles.iconsContainer}>
                        <MaterialIcons name='message-reply' size={30} color='white' />
                        <Text style={styles.iconText}>Message</Text>
                    </View>
                </View>

                <View style={styles.row}>
                    {/* Decline Button */}
                    <Pressable onPress={onDecline} style={styles.iconsContainer}>
                        <View style={styles.iconButtonContainer}>
                            <MaterialIcons name='close' size={40} color='white' />
                        </View>

                        <Text style={styles.iconText}>Decile</Text>
                    </Pressable>

                    {/* Accept Button */}
                    <Pressable onPress={onAccept} style={styles.iconsContainer}>
                        <View style={[styles.iconButtonContainer, { backgroundColor: '#2e7bff' }]}>
                            <MaterialIcons name='check' size={40} color='white' />
                        </View>

                        <Text style={styles.iconText}>Accept</Text>
                    </Pressable>
                </View>
            </ImageBackground>
        </View>
    )
}

export default IncomingCallScreen

const styles = StyleSheet.create({
    root: {
        height: '100%',
    },
    name: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 100,
        marginBottom: 15
    },
    phoneNumber: {
        fontSize: 20,
        color: 'white',
    },
    bg: {
        backgroundColor: 'red',
        flex: 1,
        alignItems: 'center',
        padding: 10,
        paddingBottom: 50,
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    iconsContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    iconText: {
        color: 'white',
        marginTop: 10,
    },
    iconButtonContainer: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 50,
        margin: 10,
    },
})