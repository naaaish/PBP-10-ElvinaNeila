import React, { useState, useRef } from 'react';
import { 
    Button, SafeAreaView, ScrollView, StyleSheet, 
    Text, TextInput, View, Alert, Platform, StatusBar 
} from 'react-native';

// Firebase getter
import { getAuth, getDb } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// MMKV
import { MMKV } from 'react-native-mmkv';
import { router } from 'expo-router'; // Untuk navigasi

// ---------------------------------------------------
// HALAMAN REGISTRASI
// ---------------------------------------------------
export default function IndexPage() {

    // MMKV lazy init
    const storageRef = useRef<MMKV | null>(null);

    // FUNGSI PERTAHANAN CRASH MMKV
    const getStorage = () => {
        if (storageRef.current === null) {
            try {
                
                storageRef.current =  MMKV({ id: "pbp1-storage-register" });
                console.log("MMKV: Inisialisasi sukses.");
            } catch (e: any) {
                // Tangkap error native MMKV dan lanjutkan tanpa crash
                console.error("MMKV CRASH DI NATIVE. Lanjut tanpa MMKV: " + e.message);
            }
        }
        return storageRef.current;
    };

    // State input form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nama, setNama] = useState('');
    const [nim, setNim] = useState('');
    const [angkatan, setAngkatan] = useState('');
    const [jurusan, setJurusan] = useState('');
    const [fakultas, setFakultas] = useState('');
    const [tglLahir, setTglLahir] = useState('');
    const [alamat, setAlamat] = useState('');
    const [loading, setLoading] = useState(false);

    // ---------------------------------------------------
    // FUNGSI REGIST
    // ---------------------------------------------------
    const handleRegister = async () => {
        if (!email || !password || !nama || !nim) {
            Alert.alert("Error", "Email, Password, Nama, dan NIM wajib diisi!");
            return;
        }

        setLoading(true);

        const auth = getAuth();
        const db = getDb();
        const storage = getStorage(); // Akan null jika MMKV crash

        try {
            // 1. Register Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Auth berhasil. UID:", user.uid);

            // 2. Data mahasiswa
            const dataMahasiswa = {
                nama, nim, angkatan, jurusan,
                fakultas, tglLahir, alamat, email,
                uid: user.uid
            };

            // 3. Simpan Firestore (KOLEKSI 'mahasiswa1')
            await setDoc(doc(db, "mahasiswa1", user.uid), dataMahasiswa);
            console.log("Firestore berhasil disimpan ke koleksi mahasiswa1");

            // 4. Simpan UID ke MMKV jika MKKV berhasil diinisialisasi
            if (storage) { 
                storage.set("user.uid", user.uid);
                console.log("UID disimpan ke MMKV.");
            } else {
                console.warn("MMKV GAGAL DISIMPAN karena error native.");
            }

            Alert.alert("Sukses!", "Registrasi berhasil!");
            router.replace('/home'); // direct home 

        } catch (err: any) {
            console.error("Registrasi gagal:", err);
            Alert.alert("Registrasi Gagal", err.message || "Terjadi error. Cek Rules Firestore!");
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Registrasi Mahasiswa</Text>

                <TextInput style={styles.input} placeholder="Email*" 
                    value={email} onChangeText={setEmail} 
                    autoCapitalize="none" keyboardType="email-address" 
                />

                <TextInput style={styles.input} placeholder="Password*" 
                    value={password} onChangeText={setPassword} secureTextEntry 
                />

                <View style={styles.separator} />

                <TextInput style={styles.input} placeholder="Nama Lengkap*" 
                    value={nama} onChangeText={setNama} 
                />
                <TextInput style={styles.input} placeholder="NIM*" 
                    value={nim} onChangeText={setNim} keyboardType="numeric" 
                />
                <TextInput style={styles.input} placeholder="Angkatan (cth: 2023)" 
                    value={angkatan} onChangeText={setAngkatan} keyboardType="numeric" 
                />
                <TextInput style={styles.input} placeholder="Jurusan (cth: Teknik Informatika)" 
                    value={jurusan} onChangeText={setJurusan} 
                />
                <TextInput style={styles.input} placeholder="Fakultas (cth: FT)" 
                    value={fakultas} onChangeText={setFakultas} 
                />
                <TextInput style={styles.input} placeholder="Tgl Lahir (DD-MM-YYYY)" 
                    value={tglLahir} onChangeText={setTglLahir} 
                />
                <TextInput style={styles.input} placeholder="Alamat" 
                    value={alamat} onChangeText={setAlamat} multiline
                />

                <Button title={loading ? "Mendaftar..." : "Daftar Sekarang"} onPress={handleRegister} disabled={loading} />
            </ScrollView>
        </SafeAreaView>
    );
}

// STYLE
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },
    scrollContainer: {
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center"
    },
    input: {
        height: 45,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        borderRadius: 5
    },
    separator: {
        height: 1,
        backgroundColor: "#ccc",
        marginVertical: 15
    }
});
