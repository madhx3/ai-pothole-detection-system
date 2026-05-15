import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

DATASET_DIR   = "dataset"
MODEL_OUTPUT  = "pothole_model.h5"
IMG_SIZE      = (224, 224)
BATCH_SIZE    = 32
EPOCHS        = 10

train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=15,
    horizontal_flip=True,
    zoom_range=0.1,
    validation_split=0.2,
)

train_gen = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    subset="training",
)

val_gen = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="binary",
    subset="validation",
)

print("Class indices:", train_gen.class_indices)

base = tf.keras.applications.MobileNetV2(input_shape=(224,224,3), include_top=False, weights="imagenet")
base.trainable = False

model = tf.keras.Sequential([
    base,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(1, activation="sigmoid"),
])

model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])

callbacks = [
    tf.keras.callbacks.ModelCheckpoint(MODEL_OUTPUT, save_best_only=True, monitor="val_accuracy", verbose=1),
    tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
]

model.fit(train_gen, validation_data=val_gen, epochs=EPOCHS, callbacks=callbacks)
print(f"\n✅ Model saved to {MODEL_OUTPUT}")