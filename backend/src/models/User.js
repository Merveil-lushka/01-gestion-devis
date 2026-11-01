import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [6, 'Le mot de passe doit faire au moins 6 caractères'],
    },
    role: {
      type: String,
      enum: ['admin', 'secretaire', 'technicien', 'consultation'],
      default: 'consultation',
    },
    isActive: {
      type: Boolean,
      default: true, // Permet de désactiver un compte sans le supprimer
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  }
);

// Hook (middleware Mongoose) : Hache le mot de passe avant sauvegarde
userSchema.pre('save', async function () {
  // Si le mot de passe n'a pas été modifié (ex: on change juste le nom), on ne le re-hache pas
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode personnalisée pour comparer le mot de passe saisi avec celui de la base
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;