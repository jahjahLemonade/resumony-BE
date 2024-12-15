import {FIREBASE_COLLECTION} from '../config/firebase/constants.js'
import {firebase, firebaseDb} from '../config/firebase/index.js'
import admin from 'firebase-admin'

const convertFirebaseResponse = snapshot => {
  const results = []

  snapshot.forEach(doc => {
    results.push({id: doc.id, ...doc.data()})
  })

  return results
}

export const getRecordsFromCollection = async ({
  collectionName,
  conditions,
  limit, // Optional limit parameter
}) => {
  let query = firebaseDb.collection(collectionName)

  // Loop through the conditions object and apply each where clause
  for (const [key, value] of Object.entries(conditions)) {
    query = query.where(key, '==', value)
  }

  // Apply limit if it's provided
  if (limit) {
    query = query.limit(limit)
  }
  const snapshots = await query.get()

  const results = convertFirebaseResponse(snapshots)
  return results
}

export const getRecordByIdFromCollection = async ({
  collectionName,
  recordId,
}) => {
  const doc = await firebaseDb.collection(collectionName).doc(recordId).get()
  if (!doc.exists) {
    return
  }
  return {id: doc.id, ...doc.data()}
}

export const updateRecordById = async ({
  collectionName,
  recordId,
  updatedData,
}) => {
  const docRef = firebaseDb.collection(collectionName).doc(recordId)

  // Check if the document exists before updating
  const doc = await docRef.get()
  if (!doc.exists) {
    throw new Error('No document found with the given ID')
  }

  // Update the document with the new data
  await docRef.update(updatedData)

  // Return the updated document
  const updatedDoc = await docRef.get()
  return {id: updatedDoc.id, ...updatedDoc.data()}
}

export const addRecordsInCollection = async ({
  collectionName,
  record,
  recordId,
}) => {
  if (recordId) {
    await firebaseDb.collection(collectionName).doc(recordId).set(record)
    return
  }
  const response = await firebaseDb.collection(collectionName).add(record)
  return response
}

export const deleteRecordsInCollection = async ({collectionName, recordId}) => {
  const response = await firebaseDb
    .collection(collectionName)
    .doc(recordId)
    .delete()
  return response
}

export const addOrUpdatePaymentPlan = async ({customerId, data}) => {
  console.log({customerId, data})
  const {paymentInfo, ...otherInfo} = data
  const docRef = firebaseDb
    .collection(FIREBASE_COLLECTION.PAYMENTS)
    .doc(customerId)

  // Check if the document exists before updating
  const doc = await docRef.get()
  if (!doc.exists) {
    // If the document does not exist, create a new one with the payments array
    await docRef.set({
      payments: [paymentInfo], // Initialize payments as an array with the first payment
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      ...otherInfo,
    })
    return
  }
  // If the document exists, update the payments array using arrayUnion to avoid duplicates
  await docRef.update({
    payments: admin.firestore.FieldValue.arrayUnion(paymentInfo),
    updatedAt: admin.firestore.Timestamp.now(),
    ...otherInfo,
  })
  return
}
// export const addOrUpdatePaymentPlan = async ({userId, data}) => {
//   const docRef = firebaseDb.collection(FIREBASE_COLLECTION.PAYMENTS).doc(userId)

//   // Check if the document exists before updating
//   const doc = await docRef.get()
//   if (!doc.exists) {
//     await firebaseDb
//       .collection(FIREBASE_COLLECTION.PAYMENTS)
//       .doc(userId)
//       .set(data)
//     return
//   }

//   // Update the document with the new data
//   await docRef.update(data)
//   return
// }
