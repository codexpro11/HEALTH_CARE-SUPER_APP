package com.healthconnect.android;
import android.content.Context;
import android.security.keystore.*;
import android.util.AtomicFile;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;

/** One atomic AES-GCM encrypted file per state/attachment. Keys never leave AndroidKeyStore. */
final class SecureStore {
    private final File root;
    private final SecretKey key;
    SecureStore(Context context) throws Exception {
        root=new File(context.getNoBackupFilesDir(),"vault"); if(!root.isDirectory() && !root.mkdirs()) throw new IOException("Secure storage unavailable.");
        KeyStore ks=KeyStore.getInstance("AndroidKeyStore"); ks.load(null);
        if(!ks.containsAlias("healthconnect.v1")) {
            KeyGenerator gen=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
            gen.init(new KeyGenParameterSpec.Builder("healthconnect.v1",KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build()); gen.generateKey();
        }
        key=(SecretKey)ks.getKey("healthconnect.v1",null);
    }
    private AtomicFile file(String name) { return new AtomicFile(new File(root,Rules.accountKey(name))); }
    synchronized byte[] read(String name) throws Exception {
        AtomicFile file=file(name); byte[] all;
        try(InputStream input=file.openRead()) { all=HttpTransport.read(input,VaultCipher.MAX_ENCRYPTED); }
        catch(FileNotFoundException missing) { return null; }
        return VaultCipher.decrypt(key,name,all);
    }
    synchronized void write(String name,byte[] data) throws Exception {
        byte[] encrypted=VaultCipher.encrypt(key,name,data); AtomicFile file=file(name); FileOutputStream out=null;
        try { out=file.startWrite(); out.write(encrypted); file.finishWrite(out); }
        catch(Exception e) { if(out!=null)file.failWrite(out); throw e; }
    }
    String text(String name) throws Exception { byte[] data=read(name); return data==null?null:new String(data,StandardCharsets.UTF_8); }
    void text(String name,String value) throws Exception { write(name,value.getBytes(StandardCharsets.UTF_8)); }
    void delete(String name) { file(name).delete(); }
}
