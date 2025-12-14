import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert, ScrollView, Platform, StatusBar, SafeAreaView } from 'react-native';
import { getAuth, getDb } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { router } from 'expo-router';
import { MMKV } from 'react-native-mmkv';

// Tipe data Mahasiswa
type Mahasiswa = {
    nama: string;
    nim: string;
    angkatan: string;
    jurusan: string;
    fakultas: string;
    tglLahir: string;
    alamat: string;
    email: string;
    uid: string;
};

// ---------------------------------------------------
// FUNGSI MMKV (untuk logout)
// ---------------------------------------------------
const getStorage = () => {
    try {
        return new MMKV({ id: 'pbp1-auth-store' });
    } catch (e) {
        console.warn("MMKV Init Failed di Home Screen.");
        return null;
    }
};

// ---------------------------------------------------
// HALAMAN DATA USER YANG SEDANG LOGIN
// ---------------------------------------------------
export default function HomeScreen() {
    const [userData, setUserData] = useState<Mahasiswa | null>(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();
    const db = getDb();
    const user = auth.currentUser;

    // Ambil data dari Firestore
    useEffect(() => {
        // Mencegah fetch jika user belum terautentikasi 
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                // Ambil data mahasiswa1 dengan ID = UID user yang login
                const docRef = doc(db, 'mahasiswa1', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // Pastikan semua field ada
                    setUserData({ ...docSnap.data() as Omit<Mahasiswa, 'uid'>, uid: user.uid });
                } else {
                    Alert.alert("Data Tidak Ditemukan", "Data registrasi Anda belum tersimpan di Firestore.");
                }
            } catch (error) {
                console.error("Error mengambil data:", error);
                Alert.alert("Error", "Gagal mengambil data dari Firestore.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user, db]);

    const handleLogout = async () => {
        const storage = getStorage();
        try {
            await signOut(auth);
            storage?.delete('user.uid'); 
            router.replace('/'); 
        } catch (error) {
            console.error("Logout gagal:", error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10 }}>Memuat Data...</Text>
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Data Mahasiswa</Text>
                <Text style={styles.noData}>Tidak ada data yang ditemukan untuk user ini.</Text>
                <View style={{ marginTop: 20 }}>
                    <Button title="Logout" onPress={handleLogout} color="#dc3545" />
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Data Registrasi Anda</Text>
                
                <View style={styles.card}>
                    <Text style={styles.label}>Nama Lengkap:</Text>
                    <Text style={styles.value}>{userData.nama}</Text>

                    <Text style={styles.label}>NIM:</Text>
                    <Text style={styles.value}>{userData.nim}</Text>
                    
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{userData.email}</Text>

                    <View style={styles.separator} />

                    <Text style={styles.label}>Jurusan / Fakultas:</Text>
                    <Text style={styles.value}>{userData.jurusan} / {userData.fakultas}</Text>
                    
                    <Text style={styles.label}>Angkatan:</Text>
                    <Text style={styles.value}>{userData.angkatan}</Text>
                    
                    <Text style={styles.label}>Tanggal Lahir:</Text>
                    <Text style={styles.value}>{userData.tglLahir}</Text>
                    
                    <Text style={styles.label}>Alamat:</Text>
                    <Text style={styles.value}>{userData.alamat}</Text>
                </View>
                
                <View style={{ marginTop: 20 }}>
                    <Button title="Logout" onPress={handleLogout} color="#dc3545" />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

// STYLE
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 25,
        textAlign: 'center',
        color: '#007bff',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    label: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 10,
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        marginBottom: 5,
        color: '#343a40',
        fontWeight: '600',
    },
    separator: {
        height: 1,
        backgroundColor: '#e9ecef',
        marginVertical: 15,
    },
    noData: {
        textAlign: 'center',
        fontSize: 16,
        color: '#dc3545',
        marginTop: 30,
    }
});