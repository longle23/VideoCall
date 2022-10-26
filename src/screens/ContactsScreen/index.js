import { StyleSheet, Text, View, FlatList, TextInput, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'

import { useNavigation } from '@react-navigation/native';
import { Voximplant } from 'react-native-voximplant';

import dummyContacts from '../../../assets/data/contacts.json'

const ContactsScreen = () => {

    const [searchTerm, setSearchTerm] = useState('')
    // console.log(searchTerm);

    const [filteredContacts, setFilteredContacts] = useState(dummyContacts)

    const navigation = useNavigation();
    const voximplant = Voximplant.getInstance();

    useEffect(() => {
        voximplant.on(Voximplant.ClientEvents.IncomingCall, incomingCallEvent => {
            navigation.navigate('IncomingCall', { call: incomingCallEvent.call });
        });

        return () => {
            voximplant.off(Voximplant.ClientEvents.IncomingCall);
        }
    }, []);

    // When searchTerm update change value, function will be called
    useEffect(() => {
        const newContacts = dummyContacts.filter(contact =>
            contact.user_display_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        )

        setFilteredContacts(newContacts)
    }, [searchTerm])

    const callUser = user => {
        navigation.navigate('Calling', { user })
    }

    return (
        <View style={styles.page}>
            <TextInput value={searchTerm}
                onChangeText={setSearchTerm}
                style={styles.searchInput}
                placeholder='Search...' />

            <FlatList
                data={filteredContacts}
                renderItem={({ item }) => (
                    <Pressable onPress={() => callUser(item)}>
                        <Text style={styles.contactName}>{item.user_display_name}</Text>
                    </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

        </View>
    )
}

export default ContactsScreen

const styles = StyleSheet.create({
    page: {
        padding: 15,
        backgroundColor: 'white',
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        marginVertical: 10,
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    searchInput: {
        backgroundColor: '#C6C9C6',
        padding: 10,
        borderRadius: 5
    }
})