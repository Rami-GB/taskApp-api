const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('age must be greter then zero!')
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Not a valid email!');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Not a valid password!');
            }
        }
    },
    avatar: {
        type: Buffer
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
}, {
    timestamps: true
}
);

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.toJSON = function () {
    const user = this.toObject();

    delete user.password;
    delete user.tokens;
    delete user.avatar;

    return user;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    try {
        let tok = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        //console.log(typeof(token));
        user.tokens.push({ token: tok });
        await user.save();

        return tok;
    } catch (e) {
        console.log(e);
    }
}

userSchema.statics.findByCredentials = async (email, password) => {
    try {
        let user = await User.findOne({ email: email },
            { age: 1, name: 1, email: 1, createdAt: 1, updatedAt: 1, password: 1, tokens: 1 });
        //console.log(user);
        if (!user) throw Error('Unable to login!');

        let isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) throw Error('Unable to login');

        return user;
    } catch (error) {
        console.log(error);
    }
}

//Hashing âssword before saving
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
})

//Delete all related tasks before removing user
userSchema.pre('remove', async function (next) {
    const user = this;

    await Task.deleteMany({ owner: user._id })
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;