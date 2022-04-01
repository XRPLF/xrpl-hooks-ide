export const hookapiH = `/**
* Hook API include file
*
* Note to the reader:
* This include defines two types of things: external functions and macros
* Functions are used sparingly because a non-inlining compiler may produce
* undesirable output.
*
* Find documentation here: https://xrpl-hooks.readme.io/v2.0/reference/
*/



#ifndef HOOKAPI_INCLUDED
#define HOOKAPI_INCLUDED 1
#include <stdint.h>

int64_t hook(uint32_t reserved) __attribute__((used));
int64_t cbak(uint32_t reserved) __attribute__((used));

/**
* Guard function. Each time a loop appears in your code a call to this must be the first branch instruction after the
* beginning of the loop.
* @param id The identifier of the guard (typically the line number).
* @param maxiter The maximum number of times this loop will iterate across the life of the hook.
* @return Can be ignored. If the guard is violated the hook will terminate.
*/
extern int32_t _g                  (uint32_t id, uint32_t maxiter) __attribute__((noduplicate));

/**
* Accept the originating transaction and commit all hook state changes and submit all emitted transactions.
* @param read_ptr An optional string to use as a return comment. May be 0.
* @param read_len The length of the string. May be 0.
* @param error_code A return code specific to this hook to be stored in execution metadata.
* @return Will never return, terminates the hook.
*/
extern int64_t accept              (uint32_t read_ptr,  uint32_t read_len,   int64_t error_code);

/**
* Rollback the originating transaction, discard all hook state changes and emitted transactions.
* @param read_ptr An optional string to use as a return comment. May be 0.
* @param read_len The length of the string. May be 0.
* @param error_code A return code specific to this hook to be stored in execution metadata.
* @return Will never return, terminates the hook.
*/
extern int64_t rollback            (uint32_t read_ptr,  uint32_t read_len,   int64_t error_code);

/**
* Read a 20 byte account-id from the memory pointed to by read_ptr of length read_len and encode it to a base58-check
* encoded r-address.
* @param read_ptr The memory address of the account-id
* @param read_len The byte length of the account-id (should always be 20)
* @param write_ptr The memory address of a suitable buffer to write the encoded r-address into.
* @param write_len The size of the write buffer.
* @return On success the length of the r-address will be returned indicating the bytes written to the write buffer.
*         On failure a negative integer is returned indicating what went wrong.
*/
extern int64_t util_raddr          (uint32_t write_ptr, uint32_t write_len,
                                   uint32_t read_ptr,  uint32_t read_len);

/**
* Read an r-address from the memory pointed to by read_ptr of length read_len and decode it to a 20 byte account id
* and write to write_ptr
* @param read_ptr The memory address of the r-address
* @param read_len The byte length of the r-address
* @param write_ptr The memory address of a suitable buffer to write the decoded account id into.
* @param write_len The size of the write buffer.
* @return On success 20 will be returned indicating the bytes written. On failure a negative integer is returned
*         indicating what went wrong.
*/
extern int64_t util_accid          (uint32_t write_ptr, uint32_t write_len,
                                   uint32_t read_ptr,  uint32_t read_len);

/**
* Verify a cryptographic signature either ED25519 of SECP256k1. Public key should be prefixed with 0xED for 25519.
* @param dread_ptr The memory location of the data or payload to verify
* @param dread_len The length of the data or payload to verify
* @param sread_ptr The memory location of the signature
* @param sread_len The length of the signature
* @param kread_ptr The memory location of the public key
* @param kread_len The length of the public key
* @return True if and only if the signature was verified.
*/
extern int64_t util_verify         (uint32_t dread_ptr, uint32_t dread_len,
                                   uint32_t sread_ptr, uint32_t sread_len,
                                   uint32_t kread_ptr, uint32_t kread_len);

/**
* Compute the first half of a SHA512 checksum.
* @param write_ptr The buffer to write the checksum into. Must be at least 32 bytes.
* @param write_len The length of the buffer.
* @param read_ptr  The buffer to read data for digest from.
* @param read_len  The amount of data to read from the buffer.
* @return The number of bytes written to write_ptr or a negative integer on error.
*/
extern int64_t util_sha512h        (uint32_t write_ptr, uint32_t write_len,
                                   uint32_t read_ptr,  uint32_t read_len);

/**
* Compute a serialized keylet of a given type.
* @param write_ptr Pointer to a buffer the serialized keylet will be written to.
* @param write_len Length of output buffer, should be at least 34.
* @param keylet_type	One of the keylet types.
* @param a	Interpreted according to keylet_type - see keylet table in function documentation.
* @param b	Interpreted according to keylet_type - see keylet table in function documentation.
* @param c	Interpreted according to keylet_type - see keylet table in function documentation.
* @param d	Interpreted according to keylet_type - see keylet table in function documentation.
* @param e	Interpreted according to keylet_type - see keylet table in function documentation.
* @param f	Interpreted according to keylet_type - see keylet table in function documentation.
* @return The number of bytes written (should always be 32), or a negative integer on error.
*/
extern int64_t util_keylet         (uint32_t write_ptr, uint32_t write_len, uint32_t keylet_type,
                                   uint32_t a,         uint32_t b,         uint32_t c,
                                   uint32_t d,         uint32_t e,         uint32_t f);

/**
* Index into a xrpld serialized object and return the location and length of a subfield. Except for Array subtypes
* the offset and length refer to the **payload** of the subfield not the entire subfield. Use SUB_OFFSET and
* SUB_LENGTH macros to extract return value.
* @param read_ptr The memory location of the stobject
* @param read_len The length of the stobject
* @param field_id The Field Code of the subfield
* @return high-word (most significant 4 bytes excluding the most significant bit (MSB)) is the field offset relative
*         to read_ptr and the low-word (least significant 4 bytes) is its length. MSB is sign bit, if set (negative)
*         return value indicates error (typically error means could not find.)
*/
extern int64_t sto_subfield       (uint32_t read_ptr,  uint32_t read_len, uint32_t field_id);

/**
* Index into a xrpld serialized array and return the location and length of an index. Unlike sto_subfield this api
* always returns the offset and length of the whole object at that index (not its payload.) Use SUB_OFFSET and
* SUB_LENGTH macros to extract return value.
* @param read_ptr The memory location of the stobject
* @param read_len The length of the stobject
* @param array_id The index requested
* @return high-word (most significant 4 bytes excluding the most significant bit (MSB)) is the field offset relative
*         to read_ptr and the low-word (least significant 4 bytes) is its length. MSB is sign bit, if set (negative)
*         return value indicates error (typically error means could not find.)
*/
extern int64_t sto_subarray       (uint32_t read_ptr,  uint32_t read_len, uint32_t array_id);

/**
* Emplace a field into an existing STObject at its canonical placement.
* @param write_ptr The buffer to write the modified STObject to
* @param write_len The length of the output buffer
* @param sread_ptr The buffer to read the source STObject from
* @param sread_len The length of the source object
* @param fread_ptr The buffer to read the field to be emplaced/injected from
* @param fread_len The length of the field to be emplaced/injected
* @param field_id The sf code (location) to form the emplacement
* @return The number of bytes written, or a negative integer on error.
*/
extern int64_t sto_emplace        (uint32_t write_ptr, uint32_t write_len,
                                  uint32_t sread_ptr, uint32_t sread_len,
                                  uint32_t fread_ptr, uint32_t fread_len, uint32_t field_id);

/**
* Remove a field from an STObject.
* @param write_ptr The buffer to write the modified STObject to
* @param write_len The length of the output buffer
* @param read_ptr The buffer to read the source STObject from
* @param read_len The length of the source object
* @param field_id The sf code (location) to erase
* @return The number of bytes written, or a negative integer on error.
*/
extern int64_t sto_erase          (uint32_t write_ptr,  uint32_t write_len,
                                  uint32_t read_ptr,   uint32_t read_len, uint32_t field_id);

/**
* Validate an STObject.
* @param read_ptr The buffer to read the source STObject from
* @param read_len The length of the source object
* @return 1 if the STObject pointed to by read_ptr is a valid STObject, 0 if it isn't, negative integer on error.
*/
extern int64_t sto_validate       (uint32_t read_ptr,  uint32_t read_len);

/**
* Compute burden for an emitted transaction.
* @return the burden a theoretically emitted transaction would have.
*/
extern int64_t etxn_burden         (void);

/**
* Write a full emit_details stobject into the buffer specified.
* @param write_ptr A sufficiently large buffer to write into.
* @param write_len The length of that buffer.
* @return The number of bytes written or a negative integer indicating an error.
*/
extern int64_t etxn_details        (uint32_t write_ptr,  uint32_t write_len);

/**
* Compute the minimum fee required to be paid by a hypothetically emitted transaction based on its size in bytes.
* @param tx_byte_count The size of the emitted transaction in bytes
* @return The minimum fee in drops this transaction should pay to succeed
*/
extern int64_t etxn_fee_base       (uint32_t tx_byte_count);

/**
* Inform xrpld that you will be emitting at most @count@ transactions during the course of this hook execution.
* @param count The number of transactions you intend to emit from this  hook.
* @return If a negative integer an error has occured
*/
extern int64_t etxn_reserve        (uint32_t count);

/**
* Compute the generation of an emitted transaction. If this hook was invoked by a transaction emitted by a previous
* hook then the generation counter will be 1+ the previous generation counter otherwise it will be 1.
* @return The generation of a hypothetically emitted transaction.
*/
extern int64_t etxn_generation     (void);

/**
* Emit a transaction from this hook.
* @param read_ptr Memory location of a buffer containing the fully formed binary transaction to emit.
* @param read_len The length of the transaction.
* @return A negative integer if the emission failed.
*/
extern int64_t emit                (uint32_t write_ptr, uint32_t write_len, uint32_t read_ptr, uint32_t read_len);

/**
* Create a float from an exponent and mantissa.
* @param exponent An exponent in the range -96 to 80
* @param mantissa A mantissa. If negative then the sign of the float is negative.
* @return The XFL (xls17) enclosing number, or a negative integer on error.
*/
extern int64_t float_set           (int32_t exponent,   int64_t mantissa);

/**
* Multiply two XFL numbers together.
* @param float1 An XFL floating point enclosing number representing the first operand to the multiplication
* @param float2 An XFL floating point enclosing number representing the second operand to the multiplication
* @return The XFL (xls17) enclosing number, or a negative integer on error.
*/
extern int64_t float_multiply      (int64_t float1,     int64_t float2);

/**
* Multiply an XFL floating point by a non-XFL numerator and denominator.
* @param float1 An XFL floating point enclosing number representing the first operand to the multiplication
* @param round_up If non-zero all computations will be rounded up
* @param numerator The numerator of the quotient that the float will be multiplied by
* @param denominator The denominator of the quotient that the float will be multiplied by
* @return The XFL (xls17) enclosing number, or a negative integer on error.
*/
extern int64_t  float_mulratio      (int64_t float1,     uint32_t round_up,
                                    uint32_t numerator, uint32_t denominator);

/**
* Negate an XFL floating point number.
* @param float1 An XFL floating point enclosing number
* @return The XFL (xls17) enclosing number, or a negative integer on error.
*/
extern int64_t  float_negate        (int64_t float1);

/**
* Perform a comparison on two XFL floating point numbers
* @param float1 An XFL floating point enclosing number representing the first operand to the comparison
* @param float2 An XFL floating point enclosing number representing the second operand to the comparison
* @param mode A bit-flag field consisting of any of (or any logically valid combination of) the comparison flags
* @return 0 if the comparison was logically false, 1 if the comparison was logically true, negative integer on error.
*/
extern int64_t  float_compare       (int64_t float1,     int64_t float2, uint32_t mode);

/**
* Add two XFL numbers together
* @param float1 An XFL floating point enclosing number representing the first operand to the addition
* @param float2 An XFL floating point enclosing number representing the second operand to the addition
* @return The XFL (xls17) enclosing number, or a negative integer on error.
*/
extern int64_t  float_sum           (int64_t float1,     int64_t float2);

extern int64_t  float_sto           (uint32_t write_ptr, uint32_t write_len,
                                    uint32_t cread_ptr, uint32_t cread_len,
                                    uint32_t iread_ptr, uint32_t iread_len,
                                    int64_t float1,     uint32_t field_code);

extern int64_t  float_sto_set       (uint32_t read_ptr,  uint32_t read_len);

/**
* Divide one by an XFL floating point number.
* @param float1 An XFL floating point enclosing number
* @return The XFL (xls17) enclosing number, or a negative integer on error.
*/
extern int64_t  float_invert        (int64_t float1);

/**
* Divide an XFL by another XFL floating point number.
* @param float1 An XFL floating point enclosing number to act as numerator
* @param float2 An XFL floating point enclosing number to act as denominator
* @return The XFL (xls17) enclosing number, or a negative integer on error.
*/
extern int64_t  float_divide        (int64_t float1,     int64_t float2);

/**
* Return the number 1 represented in an XFL enclosing number.
* @return The XFL (xls17) enclosing number.
*/
extern int64_t  float_one           ();

/**
* Get the exponent of an XFL enclosing number.
* @param float1 An XFL floating point enclosing number
* @return The exponent of the XFL, or a negative integer on error.
*/
extern int64_t  float_exponent      (int64_t float1);

/**
* Get the mantissa of an XFL enclosing number.
* @param float1 An XFL floating point enclosing number
* @return The mantissa of the XFL, or a negative integer on error.
*/
extern int64_t  float_mantissa      (int64_t float1);

/**
* Get the sign of an XFL enclosing number.
* @param float1 An XFL floating point enclosing number
* @return The sign of the XFL (0 if positive, 1 if negative), or a negative integer on error.
*/
extern int64_t  float_sign          (int64_t float1);

/**
* Set the exponent of an XFL enclosing number.
* @param float1 An XFL floating point enclosing number
* @param exponent The new exponent to set
* @return The new XFL with the updated exponent, or a negative integer on error.
*/
extern int64_t  float_exponent_set  (int64_t float1,     int32_t exponent);

/**
* Set the sign of an XFL enclosing number.
* @param float1 An XFL floating point enclosing number
* @param mantissa The new mantissa to set
* @return The new XFL with the updated mantissa, or a negative integer on error.
*/
extern int64_t  float_mantissa_set  (int64_t float1,     int64_t mantissa);

/**
* Set the mantissa of an XFL enclosing number.
* @param float1 An XFL floating point enclosing number
* @param sign The new sign to set. 1 if negative, 0 if positive.
* @return The new XFL with the updated sign, or a negative integer on error.
*/
extern int64_t  float_sign_set      (int64_t float1,     uint32_t sign);

/**
* Convert an XFL floating point into an integer (floor).
* @param float1 An XFL floating point enclosing number
* @param decimal_places The number of places to shift the decimal to the right before computing the floor of the floating point.
* @param absolute If 1 also take the absolute of the value before returning it.
* @return The computed positive integer, or a negative integer on error.
*/
extern int64_t  float_int           (int64_t float1,     uint32_t decimal_places, uint32_t absolute);

/**
* Retrive the currently recommended minimum fee for a transaction to succeed.
*/
extern int64_t fee_base            (void);

/**
* Retrieve the current ledger sequence number
*/
extern int64_t ledger_seq          (void);

extern int64_t ledger_last_hash    (uint32_t write_ptr,  uint32_t write_len);

/**
* Retrieve a nonce for use in an emitted transaction (or another task). Can be called repeatedly for multiple nonces.
* @param write_ptr A buffer of at least 32 bytes to write into.
* @param write_len The length of that buffer
* @return The number of bytes written into the buffer of a negative integer if an error occured.
*/
extern int64_t nonce               (uint32_t write_ptr,  uint32_t write_len);

/**
* Retrieve the account the hook is running on.
* @param write_ptr A buffer of at least 20 bytes to write into.
* @param write_len The length of that buffer
* @return The number of bytes written into the buffer of a negative integer if an error occured.
*/
extern int64_t hook_account        (uint32_t write_ptr,  uint32_t write_len);

/**
* Retrieve the 32 byte namespace biased SHA512H of the currently executing Hook.
* @param write_ptr Pointer to a buffer of a suitable size to store the output.
* @param write_len Length of the output buffer.
* @param hook_no The position in the hook chain the hook is located at, or -1 for the currently executing hook.
* @return The number of bytes written, or a negative integer if an error occured.
*/
extern int64_t hook_hash           (uint32_t write_ptr,  uint32_t write_len, int32_t hook_no);

/**
* Retrieve the parameter value for a named hook parameter.
* @param write_ptr Pointer to a buffer of a suitable size to store the output.
* @param write_len Length of the output buffer.
* @param read_ptr Pointer to a buffer containing the parameter's name
* @param read_len Length of the parameter's name
* @return The number of bytes written, or a negative integer if an error occured.
*/
extern int64_t hook_param          (uint32_t write_ptr,  uint32_t write_len, uint32_t read_ptr, uint32_t read_len);

/**
* Retrieve the parameter value for a named hook parameter.
* @param read_ptr Pointer to parameter value
* @param read_len Length of the parameter value
* @param kread_ptr Pointer to the parameter name
* @param kread_len Length of the parameter name
* @param hread_ptr Pointer to hook hash.
* @param hread_len Length of hook hash (always 32).
* @return The length of the parameter value successfully set, or a negative integer if an error occured.
*/
extern int64_t hook_param_set      (uint32_t read_ptr,  uint32_t read_len, uint32_t kread_ptr, uint32_t kread_len, uint32_t hread_ptr, uint32_t hread_len);

/**
* Skip a hook that appears later in the hook chain on the hook account.
* @param read_ptr Pointer to a buffer containing the hook hash
* @param read_len Length of the hook hash (always 32)
* @param flags If 0 add the hash to the hook skip list, If 1 remove the hash from the hook skip list
* @return The number of bytes written, or a negative integer if an error occured.
*/
extern int64_t hook_skip           (uint32_t read_ptr,  uint32_t read_len, uint32_t flags);

/**
* Returns the position in the hook chain the currently executing hook occupies.
* @return The position in the chain the currently executing hook occupies. The first position is 0.
*/
extern int64_t  hook_pos           ();

extern int64_t slot                (uint32_t write_ptr, uint32_t write_len, uint32_t slot);
extern int64_t slot_clear          (uint32_t slot);
extern int64_t slot_count          (uint32_t slot);
extern int64_t slot_id             (uint32_t slot);
extern int64_t slot_set            (uint32_t read_ptr,   uint32_t read_len, int32_t  slot);
extern int64_t slot_size           (uint32_t slot);
extern int64_t slot_subarray       (uint32_t parent_slot, uint32_t array_id, uint32_t new_slot);
extern int64_t slot_subfield       (uint32_t parent_slot, uint32_t field_id, uint32_t new_slot);
extern int64_t slot_type           (uint32_t slot, uint32_t flags);
extern int64_t slot_float          (uint32_t slot);

/**
* Retrieve a value from the hook's key-value map.
* @param write_ptr A buffer to write the state value into
* @param write_len The length of that buffer
* @param kread_ptr A buffer to read the state key from
* @param kread_len The length of that key
* @return The number of bytes written or a negative integer if an error occured.
*/
extern int64_t state               (uint32_t write_ptr,  uint32_t write_len,
                                   uint32_t kread_ptr,  uint32_t kread_len);

/**
* In the hook's state key-value map, set the value for the key pointed at by kread_ptr.
* @param read_ptr A buffer containing the data to store
* @param read_len The length of the data
* @param kread_ptr A buffer containing the key
* @param kread_len The length of the key
* @return The number of bytes stored or a negative integer if an error occured
*/
extern int64_t state_set           (uint32_t read_ptr,   uint32_t read_len,
                                   uint32_t kread_ptr,  uint32_t kread_len);

/**
* Retrieve a value from another hook's key-value map.
* @param write_ptr A buffer to write the state value into
* @param write_len The length of that buffer
* @param kread_ptr A buffer to read the state key from
* @param kread_len The length of that key
* @param nread_ptr A pointer to the namespace which the key belongs to.
* @param nread_len The length of the namespace.
* @param aread_ptr A buffer containing an account-id of another account containing a hook whose state we are reading
* @param aread_len The length of the account-id (should always be 20).
* @return The number of bytes written or a negative integer if an error occured.
*/
extern int64_t state_foreign       (uint32_t write_ptr,  uint32_t write_len,
                                   uint32_t kread_ptr,  uint32_t kread_len,
                                   uint32_t nread_ptr, uint32_t nread_len,
                                   uint32_t aread_ptr,  uint32_t aread_len);

/**
* Set the Hook State on another account for a given key, value and namespace.
* @param read_ptr Pointer to the data (value) to write into Hook State. If this is 0 (null) then delete the data at this key.
* @param read_len The length of the data. If this is 0 (null) then delete the data at this key.
* @param kread_ptr A pointer to the Hook State key at which to store the value.
* @param kread_len The length of the key.
* @param nread_ptr A pointer to the namespace which the key belongs to.
* @param nread_len The length of the namespace.
* @param aread_ptr A pointer to the Account ID whose state we are trying to modify.
* @param aread_len The length of the Account ID.
* @return The number of bytes written to Hook State, or a negative integer if an error occured.
*/
extern int64_t state_foreign_set   (uint32_t read_ptr,   uint32_t read_len,
                                   uint32_t kread_ptr,  uint32_t kread_len,
                                   uint32_t nread_ptr,  uint32_t nread_len,
                                   uint32_t aread_ptr,  uint32_t aread_len);

/**
* Print some output to the trace log on xrpld. Any xrpld instance set to "trace" log level will see this.
* @param mread_ptr Pointer to a message to output before the buffer. May be null.
* @param mread_len Length of the message. May be null.
* @param dread_ptr Pointer to the buffer to output.
* @param dread_len Length of the buffer to output.
* @param as_hex If 1 output the buffer as hex, if 0 output the buffer as utf-8.
* @return 0 if successful, or a negative integer if an error occured.
*/
extern int64_t trace               (uint32_t mread_ptr, uint32_t mread_len,
                                   uint32_t dread_ptr, uint32_t dread_len,   uint32_t as_hex);

/**
* Write the contents of a slot to the XRPLD trace log.
* @param mread_ptr Pointer to a message to output before the hex-encoded serialized object found in the slot. May be null.
* @param mread_len Length of the message. May be null.
* @param slot_no The slot number.
* @return 0 if successful, or a negative integer if an error occured.
*/
extern int64_t trace_slot          (uint32_t mread_ptr, uint32_t mread_len, uint32_t slot);

/**
* Print some output to the trace log on xrpld along with a decimal number. Any xrpld instance set to "trace" log
* level will see this.
* @param read_ptr A pointer to the string to output
* @param read_len The length of the string to output
* @param number Any integer you wish to display after the text
* @return A negative value on error
*/
extern int64_t trace_num           (uint32_t read_ptr,   uint32_t read_len,   int64_t number);

/**
* Write a XFL floating point to the trace log along with a message (if any).
* @param mread_ptr A pointer to the string to output
* @param mread_len The length of the string to output
* @param number Any integer you wish to display after the text
* @return A negative value on error
*/
extern int64_t  trace_float        (uint32_t mread_ptr, uint32_t mread_len, int64_t float1);

/**
* Retrieve the burden of the originating transaction (if any)
* @return The burden of the originating transaction
*/
extern int64_t otxn_burden         (void);

/**
* Retrieve a field from the originating transaction in its raw serialized form.
* @param write_ptr A buffer to output the field into
* @param write_len The length of the buffer.
* @param field_if The field code of the field being requested
* @return The number of bytes written to write_ptr or a negative integer if an error occured.
*/
extern int64_t otxn_field          (uint32_t write_ptr,  uint32_t write_len,  uint32_t field_id);

/**
* Retrieve a field from the originating transaction as "full text" (The way it is displayed in JSON)
* @param write_ptr A buffer to write the representation into
* @param write_len The length of the buffer
* @param field_id The field code of the field being requested
* @return The number of bytes written to write_ptr or a negative integer if an error occured.
*/
extern int64_t otxn_field_txt      (uint32_t write_ptr,  uint32_t write_len,  uint32_t field_id);

/**
* Retrieve the generation of the originating transaction (if any).
* @return the generation of the originating transaction.
*/
extern int64_t otxn_generation     (void);

/**
* Retrieve the TXNID of the originating transaction.
* @param write_ptr A buffer at least 32 bytes long
* @param write_len The length of the buffer.
* @return The number of bytes written into the buffer or a negative integer on failure.
*/
extern int64_t otxn_id             (uint32_t write_ptr,  uint32_t write_len);

/**
* Retrieve the Transaction Type (e.g. ttPayment = 0) of the originating transaction.
* @return The Transaction Type (tt-code)
*/
extern int64_t otxn_type           (void);

/**
* Load the originating transaction into a slot.
* @param slot_no The slot number to emplace into, or 0 if you wish to pick the next available.
* @return The slot the otxn was placed in, or a negative integer on failure.
*/
extern int64_t otxn_slot           (uint32_t slot_no);


#define SUCCESS  0                  // return codes > 0 are reserved for hook apis to return "success"
#define OUT_OF_BOUNDS  -1           // could not read or write to a pointer to provided by hook
#define INTERNAL_ERROR  -2          // eg directory is corrupt
#define TOO_BIG  -3                 // something you tried to store was too big
#define TOO_SMALL  -4               // something you tried to store or provide was too small
#define DOESNT_EXIST  -5            // something you requested wasn't found
#define NO_FREE_SLOTS  -6           // when trying to load an object there is a maximum of 255 slots
#define INVALID_ARGUMENT  -7        // self explanatory
#define ALREADY_SET  -8             // returned when a one-time parameter was already set by the hook
#define PREREQUISITE_NOT_MET  -9    // returned if a required param wasn't set before calling
#define FEE_TOO_LARGE  -10          // returned if the attempted operation would result in an absurd fee
#define EMISSION_FAILURE  -11       // returned if an emitted tx was not accepted by rippled
#define TOO_MANY_NONCES  -12        // a hook has a maximum of 256 nonces
#define TOO_MANY_EMITTED_TXN  -13   // a hook has emitted more than its stated number of emitted txn
#define NOT_IMPLEMENTED  -14        // an api was called that is reserved for a future version
#define INVALID_ACCOUNT  -15        // an api expected an account id but got something else
#define GUARD_VIOLATION  -16        // a guarded loop or function iterated over its maximum
#define INVALID_FIELD  -17          // the field requested is returning sfInvalid
#define PARSE_ERROR  -18            // hook asked hookapi to parse something the contents of which was invalid
#define RC_ROLLBACK -19             // used internally by hook api to indicate a rollback
#define RC_ACCEPT -20               // used internally by hook api to indicate an accept
#define NO_SUCH_KEYLET -21          // the specified keylet or keylet type does not exist or could not be computed

#define INVALID_FLOAT -10024        // if the mantissa or exponent are outside normalized ranges

#define KEYLET_HOOK 1
#define KEYLET_HOOK_STATE 2
#define KEYLET_ACCOUNT 3
#define KEYLET_AMENDMENTS 4
#define KEYLET_CHILD 5
#define KEYLET_SKIP 6
#define KEYLET_FEES 7
#define KEYLET_NEGATIVE_UNL 8
#define KEYLET_LINE 9
#define KEYLET_OFFER 10
#define KEYLET_QUALITY 11
#define KEYLET_EMITTED_DIR 12
#define KEYLET_TICKET 13
#define KEYLET_SIGNERS 14
#define KEYLET_CHECK 15
#define KEYLET_DEPOSIT_PREAUTH 16
#define KEYLET_UNCHECKED 17
#define KEYLET_OWNER_DIR 18
#define KEYLET_PAGE 19
#define KEYLET_ESCROW 20
#define KEYLET_PAYCHAN 21
#define KEYLET_EMITTED 22

#define COMPARE_EQUAL 1U
#define COMPARE_LESS 2U
#define COMPARE_GREATER 4U

#include "sfcodes.h"
#include "hookmacro.h"

#endif`;

export const sfcodesH = `/**
* This file contains programmatically generated sf field codes
*/
#define sfCloseResolution ((16U << 16U) + 1U)
#define sfMethod ((16U << 16U) + 2U)
#define sfTransactionResult ((16U << 16U) + 3U)
#define sfTickSize ((16U << 16U) + 16U)
#define sfUNLModifyDisabling ((16U << 16U) + 17U)
#define sfHookResult ((16U << 16U) + 18U)
#define sfLedgerEntryType ((1U << 16U) + 1U)
#define sfTransactionType ((1U << 16U) + 2U)
#define sfSignerWeight ((1U << 16U) + 3U)
#define sfTransferFee ((1U << 16U) + 4U)
#define sfVersion ((1U << 16U) + 16U)
#define sfHookStateChangeCount ((1U << 16U) + 17U)
#define sfHookEmitCount ((1U << 16U) + 18U)
#define sfHookExecutionIndex ((1U << 16U) + 19U)
#define sfHookApiVersion ((1U << 16U) + 20U)
#define sfFlags ((2U << 16U) + 2U)
#define sfSourceTag ((2U << 16U) + 3U)
#define sfSequence ((2U << 16U) + 4U)
#define sfPreviousTxnLgrSeq ((2U << 16U) + 5U)
#define sfLedgerSequence ((2U << 16U) + 6U)
#define sfCloseTime ((2U << 16U) + 7U)
#define sfParentCloseTime ((2U << 16U) + 8U)
#define sfSigningTime ((2U << 16U) + 9U)
#define sfExpiration ((2U << 16U) + 10U)
#define sfTransferRate ((2U << 16U) + 11U)
#define sfWalletSize ((2U << 16U) + 12U)
#define sfOwnerCount ((2U << 16U) + 13U)
#define sfDestinationTag ((2U << 16U) + 14U)
#define sfHighQualityIn ((2U << 16U) + 16U)
#define sfHighQualityOut ((2U << 16U) + 17U)
#define sfLowQualityIn ((2U << 16U) + 18U)
#define sfLowQualityOut ((2U << 16U) + 19U)
#define sfQualityIn ((2U << 16U) + 20U)
#define sfQualityOut ((2U << 16U) + 21U)
#define sfStampEscrow ((2U << 16U) + 22U)
#define sfBondAmount ((2U << 16U) + 23U)
#define sfLoadFee ((2U << 16U) + 24U)
#define sfOfferSequence ((2U << 16U) + 25U)
#define sfFirstLedgerSequence ((2U << 16U) + 26U)
#define sfLastLedgerSequence ((2U << 16U) + 27U)
#define sfTransactionIndex ((2U << 16U) + 28U)
#define sfOperationLimit ((2U << 16U) + 29U)
#define sfReferenceFeeUnits ((2U << 16U) + 30U)
#define sfReserveBase ((2U << 16U) + 31U)
#define sfReserveIncrement ((2U << 16U) + 32U)
#define sfSetFlag ((2U << 16U) + 33U)
#define sfClearFlag ((2U << 16U) + 34U)
#define sfSignerQuorum ((2U << 16U) + 35U)
#define sfCancelAfter ((2U << 16U) + 36U)
#define sfFinishAfter ((2U << 16U) + 37U)
#define sfSignerListID ((2U << 16U) + 38U)
#define sfSettleDelay ((2U << 16U) + 39U)
#define sfTicketCount ((2U << 16U) + 40U)
#define sfTicketSequence ((2U << 16U) + 41U)
#define sfTokenTaxon ((2U << 16U) + 42U)
#define sfMintedTokens ((2U << 16U) + 43U)
#define sfBurnedTokens ((2U << 16U) + 44U)
#define sfHookStateCount ((2U << 16U) + 45U)
#define sfEmitGeneration ((2U << 16U) + 46U)
#define sfIndexNext ((3U << 16U) + 1U)
#define sfIndexPrevious ((3U << 16U) + 2U)
#define sfBookNode ((3U << 16U) + 3U)
#define sfOwnerNode ((3U << 16U) + 4U)
#define sfBaseFee ((3U << 16U) + 5U)
#define sfExchangeRate ((3U << 16U) + 6U)
#define sfLowNode ((3U << 16U) + 7U)
#define sfHighNode ((3U << 16U) + 8U)
#define sfDestinationNode ((3U << 16U) + 9U)
#define sfCookie ((3U << 16U) + 10U)
#define sfServerVersion ((3U << 16U) + 11U)
#define sfOfferNode ((3U << 16U) + 12U)
#define sfEmitBurden ((3U << 16U) + 13U)
#define sfHookOn ((3U << 16U) + 16U)
#define sfHookInstructionCount ((3U << 16U) + 17U)
#define sfHookReturnCode ((3U << 16U) + 18U)
#define sfReferenceCount ((3U << 16U) + 19U)
#define sfEmailHash ((4U << 16U) + 1U)
#define sfTakerPaysCurrency ((17U << 16U) + 1U)
#define sfTakerPaysIssuer ((17U << 16U) + 2U)
#define sfTakerGetsCurrency ((17U << 16U) + 3U)
#define sfTakerGetsIssuer ((17U << 16U) + 4U)
#define sfLedgerHash ((5U << 16U) + 1U)
#define sfParentHash ((5U << 16U) + 2U)
#define sfTransactionHash ((5U << 16U) + 3U)
#define sfAccountHash ((5U << 16U) + 4U)
#define sfPreviousTxnID ((5U << 16U) + 5U)
#define sfLedgerIndex ((5U << 16U) + 6U)
#define sfWalletLocator ((5U << 16U) + 7U)
#define sfRootIndex ((5U << 16U) + 8U)
#define sfAccountTxnID ((5U << 16U) + 9U)
#define sfTokenID ((5U << 16U) + 10U)
#define sfEmitParentTxnID ((5U << 16U) + 11U)
#define sfEmitNonce ((5U << 16U) + 12U)
#define sfEmitHookHash ((5U << 16U) + 13U)
#define sfBookDirectory ((5U << 16U) + 16U)
#define sfInvoiceID ((5U << 16U) + 17U)
#define sfNickname ((5U << 16U) + 18U)
#define sfAmendment ((5U << 16U) + 19U)
#define sfDigest ((5U << 16U) + 21U)
#define sfChannel ((5U << 16U) + 22U)
#define sfConsensusHash ((5U << 16U) + 23U)
#define sfCheckID ((5U << 16U) + 24U)
#define sfValidatedHash ((5U << 16U) + 25U)
#define sfPreviousPageMin ((5U << 16U) + 26U)
#define sfNextPageMin ((5U << 16U) + 27U)
#define sfBuyOffer ((5U << 16U) + 28U)
#define sfSellOffer ((5U << 16U) + 29U)
#define sfHookStateKey ((5U << 16U) + 30U)
#define sfHookHash ((5U << 16U) + 31U)
#define sfHookNamespace ((5U << 16U) + 32U)
#define sfHookSetTxnID ((5U << 16U) + 33U)
#define sfAmount ((6U << 16U) + 1U)
#define sfBalance ((6U << 16U) + 2U)
#define sfLimitAmount ((6U << 16U) + 3U)
#define sfTakerPays ((6U << 16U) + 4U)
#define sfTakerGets ((6U << 16U) + 5U)
#define sfLowLimit ((6U << 16U) + 6U)
#define sfHighLimit ((6U << 16U) + 7U)
#define sfFee ((6U << 16U) + 8U)
#define sfSendMax ((6U << 16U) + 9U)
#define sfDeliverMin ((6U << 16U) + 10U)
#define sfMinimumOffer ((6U << 16U) + 16U)
#define sfRippleEscrow ((6U << 16U) + 17U)
#define sfDeliveredAmount ((6U << 16U) + 18U)
#define sfBrokerFee ((6U << 16U) + 19U)
#define sfPublicKey ((7U << 16U) + 1U)
#define sfMessageKey ((7U << 16U) + 2U)
#define sfSigningPubKey ((7U << 16U) + 3U)
#define sfTxnSignature ((7U << 16U) + 4U)
#define sfURI ((7U << 16U) + 5U)
#define sfSignature ((7U << 16U) + 6U)
#define sfDomain ((7U << 16U) + 7U)
#define sfFundCode ((7U << 16U) + 8U)
#define sfRemoveCode ((7U << 16U) + 9U)
#define sfExpireCode ((7U << 16U) + 10U)
#define sfCreateCode ((7U << 16U) + 11U)
#define sfMemoType ((7U << 16U) + 12U)
#define sfMemoData ((7U << 16U) + 13U)
#define sfMemoFormat ((7U << 16U) + 14U)
#define sfFulfillment ((7U << 16U) + 16U)
#define sfCondition ((7U << 16U) + 17U)
#define sfMasterSignature ((7U << 16U) + 18U)
#define sfUNLModifyValidator ((7U << 16U) + 19U)
#define sfValidatorToDisable ((7U << 16U) + 20U)
#define sfValidatorToReEnable ((7U << 16U) + 21U)
#define sfHookStateData ((7U << 16U) + 22U)
#define sfHookReturnString ((7U << 16U) + 23U)
#define sfHookParameterName ((7U << 16U) + 24U)
#define sfHookParameterValue ((7U << 16U) + 25U)
#define sfAccount ((8U << 16U) + 1U)
#define sfOwner ((8U << 16U) + 2U)
#define sfDestination ((8U << 16U) + 3U)
#define sfIssuer ((8U << 16U) + 4U)
#define sfAuthorize ((8U << 16U) + 5U)
#define sfUnauthorize ((8U << 16U) + 6U)
#define sfRegularKey ((8U << 16U) + 8U)
#define sfMinter ((8U << 16U) + 9U)
#define sfEmitCallback ((8U << 16U) + 10U)
#define sfHookAccount ((8U << 16U) + 16U)
#define sfIndexes ((19U << 16U) + 1U)
#define sfHashes ((19U << 16U) + 2U)
#define sfAmendments ((19U << 16U) + 3U)
#define sfTokenOffers ((19U << 16U) + 4U)
#define sfPaths ((18U << 16U) + 1U)
#define sfTransactionMetaData ((14U << 16U) + 2U)
#define sfCreatedNode ((14U << 16U) + 3U)
#define sfDeletedNode ((14U << 16U) + 4U)
#define sfModifiedNode ((14U << 16U) + 5U)
#define sfPreviousFields ((14U << 16U) + 6U)
#define sfFinalFields ((14U << 16U) + 7U)
#define sfNewFields ((14U << 16U) + 8U)
#define sfTemplateEntry ((14U << 16U) + 9U)
#define sfMemo ((14U << 16U) + 10U)
#define sfSignerEntry ((14U << 16U) + 11U)
#define sfNonFungibleToken ((14U << 16U) + 12U)
#define sfEmitDetails ((14U << 16U) + 13U)
#define sfHook ((14U << 16U) + 14U)
#define sfSigner ((14U << 16U) + 16U)
#define sfMajority ((14U << 16U) + 18U)
#define sfDisabledValidator ((14U << 16U) + 19U)
#define sfEmittedTxn ((14U << 16U) + 20U)
#define sfHookExecution ((14U << 16U) + 21U)
#define sfHookDefinition ((14U << 16U) + 22U)
#define sfHookParameter ((14U << 16U) + 23U)
#define sfHookGrant ((14U << 16U) + 24U)
#define sfSigners ((15U << 16U) + 3U)
#define sfSignerEntries ((15U << 16U) + 4U)
#define sfTemplate ((15U << 16U) + 5U)
#define sfNecessary ((15U << 16U) + 6U)
#define sfSufficient ((15U << 16U) + 7U)
#define sfAffectedNodes ((15U << 16U) + 8U)
#define sfMemos ((15U << 16U) + 9U)
#define sfNonFungibleTokens ((15U << 16U) + 10U)
#define sfHooks ((15U << 16U) + 11U)
#define sfMajorities ((15U << 16U) + 16U)
#define sfDisabledValidators ((15U << 16U) + 17U)
#define sfHookExecutions ((15U << 16U) + 18U)
#define sfHookParameters ((15U << 16U) + 19U)
#define sfHookGrants ((15U << 16U) + 20U)`;

export const hookmacroH = `/**
* These are helper macros for writing hooks, all of them are optional as is including hookmacro.h at all
*/

#include <stdint.h>
#include "hookapi.h"
#include "sfcodes.h"

#ifndef HOOKMACROS_INCLUDED
#define HOOKMACROS_INCLUDED 1

// hook developers should use this guard macro, simply GUARD(<maximum iterations>)
#define GUARD(maxiter) _g(__LINE__, (maxiter)+1)
#define GUARDM(maxiter, n) _g(((__LINE__ << 16) + n), (maxiter)+1)

#define SBUF(str) (uint32_t)(str), sizeof(str)

#define REQUIRE(cond, str)\
{\
   if (!(cond))\
       rollback(SBUF(str), __LINE__);\
}

// make a report buffer as a c-string
// provide a name for a buffer to declare (buf)
// provide a static string
// provide an integer to print after the string
#define RBUF(buf, out_len, str, num)\
unsigned char buf[sizeof(str) + 21];\
int out_len = 0;\
{\
   volatile int _ten = 10;\
   int i = 0;\
   for (; GUARDM(sizeof(str),1),i < sizeof(str); ++i)\
       (buf)[i] = str[i];\
   if ((buf)[sizeof(str)-1] == 0) i--;\
   if ((num) < 0) (buf)[i++] = '-';\
   uint64_t unsigned_num = (uint64_t)( (num) < 0 ? (num) * -1 : (num) );\
   uint64_t j = _ten * 1000000000000000000ULL;\
   int start = 1;\
   for (; GUARDM(20,2), unsigned_num > 0 && j > 0; j /= 10)\
   {\
       unsigned char digit = ( unsigned_num / j ) % 10;\
       if (digit == 0 && start)\
           continue;\
       start = 0;\
       (buf)[i++] = '0' + digit;\
   }\
   (buf)[i] = '\0';\
   out_len = i;\
}

#define RBUF2(buff, out_len, str, num, str2, num2)\
unsigned char buff[sizeof(str) + sizeof(str2) + 42];\
int out_len = 0;\
{\
   volatile int _ten = 10;\
   unsigned char* buf = buff;\
   int i = 0;\
   for (; GUARDM(sizeof(str),1),i < sizeof(str); ++i)\
       (buf)[i] = str[i];\
   if ((buf)[sizeof(str)-1] == 0) i--;\
   if ((num) < 0) (buf)[i++] = '-';\
   uint64_t unsigned_num = (uint64_t)( (num) < 0 ? (num) * -1 : (num) );\
   uint64_t j = _ten * 1000000000000000000ULL;\
   int start = 1;\
   for (; GUARDM(20,2), unsigned_num > 0 && j > 0; j /= 10)\
   {\
       unsigned char digit = ( unsigned_num / j ) % 10;\
       if (digit == 0 && start)\
           continue;\
       start = 0;\
       (buf)[i++] = '0' + digit;\
   }\
   buf += i;\
   out_len += i;\
   i = 0;\
   for (; GUARDM(sizeof(str2),3),i < sizeof(str2); ++i)\
       (buf)[i] = str2[i];\
   if ((buf)[sizeof(str2)-1] == 0) i--;\
   if ((num2) < 0) (buf)[i++] = '-';\
   unsigned_num = (uint64_t)( (num2) < 0 ? (num2) * -1 : (num2) );\
   j = _ten * 1000000000000000000ULL;\
   start = 1;\
   for (; GUARDM(20,4), unsigned_num > 0 && j > 0; j /= 10)\
   {\
       unsigned char digit = ( unsigned_num / j ) % 10;\
       if (digit == 0 && start)\
           continue;\
       start = 0;\
       (buf)[i++] = '0' + digit;\
   }\
   (buf)[i] = '\0';\
   out_len += i;\
}

#define TRACEVAR(v) trace_num((uint32_t)(#v), (uint32_t)(sizeof(#v) - 1), (int64_t)v);
#define TRACEHEX(v) trace((uint32_t)(#v), (uint32_t)(sizeof(#v) - 1), (uint32_t)(v), (uint32_t)(sizeof(v)), 1);
#define TRACEXFL(v) trace_float((uint32_t)(#v), (uint32_t)(sizeof(#v) - 1), (int64_t)v);
#define TRACESTR(v) trace((uint32_t)(#v), (uint32_t)(sizeof(#v) - 1), (uint32_t)(v), sizeof(v), 0);

#define CLEARBUF(b)\
{\
   for (int x = 0; GUARD(sizeof(b)), x < sizeof(b); ++x)\
       b[x] = 0;\
}

// returns an in64_t, negative if error, non-negative if valid drops
#define AMOUNT_TO_DROPS(amount_buffer)\
    (((amount_buffer)[0] >> 7) ? -2 : (\
    ((((uint64_t)((amount_buffer)[0])) & 0xb00111111) << 56) +\
     (((uint64_t)((amount_buffer)[1])) << 48) +\
     (((uint64_t)((amount_buffer)[2])) << 40) +\
     (((uint64_t)((amount_buffer)[3])) << 32) +\
     (((uint64_t)((amount_buffer)[4])) << 24) +\
     (((uint64_t)((amount_buffer)[5])) << 16) +\
     (((uint64_t)((amount_buffer)[6])) <<  8) +\
     (((uint64_t)((amount_buffer)[7])))))

#define SUB_OFFSET(x) ((int32_t)(x >> 32))
#define SUB_LENGTH(x) ((int32_t)(x & 0xFFFFFFFFULL))

// when using this macro buf1len may be dynamic but buf2len must be static
// provide n >= 1 to indicate how many times the macro will be hit on the line of code
// e.g. if it is in a loop that loops 10 times n = 10
#define BUFFER_EQUAL_GUARD(output, buf1, buf1len, buf2, buf2len, n)\
{\
   output = ((buf1len) == (buf2len) ? 1 : 0);\
   for (int x = 0; GUARDM( (buf2len) * (n), 1 ), x < (buf2len);\
        ++x)\
   {\
       if ((buf1)[x] != (buf2)[x])\
       {\
           output = 0;\
           break;\
       }\
   }\
}

#define BUFFER_SWAP(x,y)\
{\
   uint8_t* z = x;\
   x = y;\
   y = z;\
}

#define ACCOUNT_COMPARE(compare_result, buf1, buf2)\
{\
   compare_result = 0;\
   for (int i = 0; GUARD(20), i < 20; ++i)\
   {\
       if (buf1[i] > buf2[i])\
       {\
           compare_result = 1;\
           break;\
       }\
       else if (buf1[i] < buf2[i])\
       {\
           compare_result = -1;\
           break;\
       }\
   }\
}

#define BUFFER_EQUAL_STR_GUARD(output, buf1, buf1len, str, n)\
   BUFFER_EQUAL_GUARD(output, buf1, buf1len, str, (sizeof(str)-1), n)

#define BUFFER_EQUAL_STR(output, buf1, buf1len, str)\
   BUFFER_EQUAL_GUARD(output, buf1, buf1len, str, (sizeof(str)-1), 1)

#define BUFFER_EQUAL(output, buf1, buf2, compare_len)\
   BUFFER_EQUAL_GUARD(output, buf1, compare_len, buf2, compare_len, 1)

#define UINT16_TO_BUF(buf_raw, i)\
{\
   unsigned char* buf = (unsigned char*)buf_raw;\
   buf[0] = (((uint64_t)i) >> 8) & 0xFFUL;\
   buf[1] = (((uint64_t)i) >> 0) & 0xFFUL;\
}

#define UINT16_FROM_BUF(buf)\
   (((uint64_t)((buf)[0]) <<  8) +\
    ((uint64_t)((buf)[1]) <<  0))

#define UINT32_TO_BUF(buf_raw, i)\
{\
   unsigned char* buf = (unsigned char*)buf_raw;\
   buf[0] = (((uint64_t)i) >> 24) & 0xFFUL;\
   buf[1] = (((uint64_t)i) >> 16) & 0xFFUL;\
   buf[2] = (((uint64_t)i) >>  8) & 0xFFUL;\
   buf[3] = (((uint64_t)i) >>  0) & 0xFFUL;\
}


#define UINT32_FROM_BUF(buf)\
   (((uint64_t)((buf)[0]) << 24) +\
    ((uint64_t)((buf)[1]) << 16) +\
    ((uint64_t)((buf)[2]) <<  8) +\
    ((uint64_t)((buf)[3]) <<  0))

#define UINT64_TO_BUF(buf_raw, i)\
{\
   unsigned char* buf = (unsigned char*)buf_raw;\
   buf[0] = (((uint64_t)i) >> 56) & 0xFFUL;\
   buf[1] = (((uint64_t)i) >> 48) & 0xFFUL;\
   buf[2] = (((uint64_t)i) >> 40) & 0xFFUL;\
   buf[3] = (((uint64_t)i) >> 32) & 0xFFUL;\
   buf[4] = (((uint64_t)i) >> 24) & 0xFFUL;\
   buf[5] = (((uint64_t)i) >> 16) & 0xFFUL;\
   buf[6] = (((uint64_t)i) >>  8) & 0xFFUL;\
   buf[7] = (((uint64_t)i) >>  0) & 0xFFUL;\
}


#define UINT64_FROM_BUF(buf)\
   (((uint64_t)((buf)[0]) << 56) +\
    ((uint64_t)((buf)[1]) << 48) +\
    ((uint64_t)((buf)[2]) << 40) +\
    ((uint64_t)((buf)[3]) << 32) +\
    ((uint64_t)((buf)[4]) << 24) +\
    ((uint64_t)((buf)[5]) << 16) +\
    ((uint64_t)((buf)[6]) <<  8) +\
    ((uint64_t)((buf)[7]) <<  0))


#define INT64_FROM_BUF(buf)\
  ((((uint64_t)((buf)[0]&7FU) << 56) +\
    ((uint64_t)((buf)[1]) << 48) +\
    ((uint64_t)((buf)[2]) << 40) +\
    ((uint64_t)((buf)[3]) << 32) +\
    ((uint64_t)((buf)[4]) << 24) +\
    ((uint64_t)((buf)[5]) << 16) +\
    ((uint64_t)((buf)[6]) <<  8) +\
    ((uint64_t)((buf)[7]) <<  0)) * (buf[0] & 0x80U ? -1 : 1))

#define INT64_TO_BUF(buf_raw, i)\
{\
   unsigned char* buf = (unsigned char*)buf_raw;\
   buf[0] = (((uint64_t)i) >> 56) & 0x7FUL;\
   buf[1] = (((uint64_t)i) >> 48) & 0xFFUL;\
   buf[2] = (((uint64_t)i) >> 40) & 0xFFUL;\
   buf[3] = (((uint64_t)i) >> 32) & 0xFFUL;\
   buf[4] = (((uint64_t)i) >> 24) & 0xFFUL;\
   buf[5] = (((uint64_t)i) >> 16) & 0xFFUL;\
   buf[6] = (((uint64_t)i) >>  8) & 0xFFUL;\
   buf[7] = (((uint64_t)i) >>  0) & 0xFFUL;\
   if (i < 0) buf[0] |= 0x80U;\
}

#define ttPAYMENT 0
#define tfCANONICAL 0x80000000UL

#define atACCOUNT 1U
#define atOWNER 2U
#define atDESTINATION 3U
#define atISSUER 4U
#define atAUTHORIZE 5U
#define atUNAUTHORIZE 6U
#define atTARGET 7U
#define atREGULARKEY 8U
#define atPSEUDOCALLBACK 9U

#define amAMOUNT 1U
#define amBALANCE 2U
#define amLIMITAMOUNT 3U
#define amTAKERPAYS 4U
#define amTAKERGETS 5U
#define amLOWLIMIT 6U
#define amHIGHLIMIT 7U
#define amFEE 8U
#define amSENDMAX 9U
#define amDELIVERMIN 10U
#define amMINIMUMOFFER 16U
#define amRIPPLEESCROW 17U
#define amDELIVEREDAMOUNT 18U

/**
* RH NOTE -- PAY ATTENTION
*
* ALL 'ENCODE' MACROS INCREMENT BUF_OUT
* THIS IS TO MAKE CHAINING EASY
* BUF_OUT IS A SACRIFICIAL POINTER
*
* 'ENCODE' MACROS WITH CONSTANTS HAVE
* ALIASING TO ASSIST YOU WITH ORDER
* _TYPECODE_FIELDCODE_ENCODE_MACRO
* TO PRODUCE A SERIALIZED OBJECT
* IN CANONICAL FORMAT YOU MUST ORDER
* FIRST BY TYPE CODE THEN BY FIELD CODE
*
* ALL 'PREPARE' MACROS PRESERVE POINTERS
*
**/


#define ENCODE_TL_SIZE 49
#define ENCODE_TL(buf_out, tlamt, amount_type)\
{\
       uint8_t uat = amount_type; \
       buf_out[0] = 0x60U +(uat & 0x0FU ); \
       for (int i = 1; GUARDM(48, 1), i < 49; ++i)\
           buf_out[i] = tlamt[i-1];\
       buf_out += ENCODE_TL_SIZE;\
}
#define _06_XX_ENCODE_TL(buf_out, drops, amount_type )\
   ENCODE_TL(buf_out, drops, amount_type );
#define ENCODE_TL_AMOUNT(buf_out, drops )\
   ENCODE_TL(buf_out, drops, amAMOUNT );
#define _06_01_ENCODE_TL_AMOUNT(buf_out, drops )\
   ENCODE_TL_AMOUNT(buf_out, drops );


// Encode drops to serialization format
// consumes 9 bytes
#define ENCODE_DROPS_SIZE 9
#define ENCODE_DROPS(buf_out, drops, amount_type ) \
   {\
       uint8_t uat = amount_type; \
       uint64_t udrops = drops; \
       buf_out[0] = 0x60U +(uat & 0x0FU ); \
       buf_out[1] = 0b01000000 + (( udrops >> 56 ) & 0b00111111 ); \
       buf_out[2] = (udrops >> 48) & 0xFFU; \
       buf_out[3] = (udrops >> 40) & 0xFFU; \
       buf_out[4] = (udrops >> 32) & 0xFFU; \
       buf_out[5] = (udrops >> 24) & 0xFFU; \
       buf_out[6] = (udrops >> 16) & 0xFFU; \
       buf_out[7] = (udrops >>  8) & 0xFFU; \
       buf_out[8] = (udrops >>  0) & 0xFFU; \
       buf_out += ENCODE_DROPS_SIZE; \
   }

#define _06_XX_ENCODE_DROPS(buf_out, drops, amount_type )\
   ENCODE_DROPS(buf_out, drops, amount_type );

#define ENCODE_DROPS_AMOUNT(buf_out, drops )\
   ENCODE_DROPS(buf_out, drops, amAMOUNT );
#define _06_01_ENCODE_DROPS_AMOUNT(buf_out, drops )\
   ENCODE_DROPS_AMOUNT(buf_out, drops );

#define ENCODE_DROPS_FEE(buf_out, drops )\
   ENCODE_DROPS(buf_out, drops, amFEE );
#define _06_08_ENCODE_DROPS_FEE(buf_out, drops )\
   ENCODE_DROPS_FEE(buf_out, drops );

#define ENCODE_TT_SIZE 3
#define ENCODE_TT(buf_out, tt )\
   {\
       uint8_t utt = tt;\
       buf_out[0] = 0x12U;\
       buf_out[1] =(utt >> 8 ) & 0xFFU;\
       buf_out[2] =(utt >> 0 ) & 0xFFU;\
       buf_out += ENCODE_TT_SIZE; \
   }
#define _01_02_ENCODE_TT(buf_out, tt)\
   ENCODE_TT(buf_out, tt);


#define ENCODE_ACCOUNT_SIZE 22
#define ENCODE_ACCOUNT(buf_out, account_id, account_type)\
   {\
       uint8_t uat = account_type;\
       buf_out[0] = 0x80U + uat;\
       buf_out[1] = 0x14U;\
       *(uint64_t*)(buf_out +  2) = *(uint64_t*)(account_id +  0);\
       *(uint64_t*)(buf_out + 10) = *(uint64_t*)(account_id +  8);\
       *(uint32_t*)(buf_out + 18) = *(uint32_t*)(account_id + 16);\
       buf_out += ENCODE_ACCOUNT_SIZE;\
   }
#define _08_XX_ENCODE_ACCOUNT(buf_out, account_id, account_type)\
   ENCODE_ACCOUNT(buf_out, account_id, account_type);

#define ENCODE_ACCOUNT_SRC_SIZE 22
#define ENCODE_ACCOUNT_SRC(buf_out, account_id)\
   ENCODE_ACCOUNT(buf_out, account_id, atACCOUNT);
#define _08_01_ENCODE_ACCOUNT_SRC(buf_out, account_id)\
   ENCODE_ACCOUNT_SRC(buf_out, account_id);

#define ENCODE_ACCOUNT_DST_SIZE 22
#define ENCODE_ACCOUNT_DST(buf_out, account_id)\
   ENCODE_ACCOUNT(buf_out, account_id, atDESTINATION);
#define _08_03_ENCODE_ACCOUNT_DST(buf_out, account_id)\
   ENCODE_ACCOUNT_DST(buf_out, account_id);

#define ENCODE_UINT32_COMMON_SIZE 5U
#define ENCODE_UINT32_COMMON(buf_out, i, field)\
   {\
       uint32_t ui = i; \
       uint8_t uf = field; \
       buf_out[0] = 0x20U +(uf & 0x0FU); \
       buf_out[1] =(ui >> 24 ) & 0xFFU; \
       buf_out[2] =(ui >> 16 ) & 0xFFU; \
       buf_out[3] =(ui >>  8 ) & 0xFFU; \
       buf_out[4] =(ui >>  0 ) & 0xFFU; \
       buf_out += ENCODE_UINT32_COMMON_SIZE; \
   }
#define _02_XX_ENCODE_UINT32_COMMON(buf_out, i, field)\
   ENCODE_UINT32_COMMON(buf_out, i, field)\

#define ENCODE_UINT32_UNCOMMON_SIZE 6U
#define ENCODE_UINT32_UNCOMMON(buf_out, i, field)\
   {\
       uint32_t ui = i; \
       uint8_t uf = field; \
       buf_out[0] = 0x20U; \
       buf_out[1] = uf; \
       buf_out[2] =(ui >> 24 ) & 0xFFU; \
       buf_out[3] =(ui >> 16 ) & 0xFFU; \
       buf_out[4] =(ui >>  8 ) & 0xFFU; \
       buf_out[5] =(ui >>  0 ) & 0xFFU; \
       buf_out += ENCODE_UINT32_UNCOMMON_SIZE; \
   }
#define _02_XX_ENCODE_UINT32_UNCOMMON(buf_out, i, field)\
   ENCODE_UINT32_UNCOMMON(buf_out, i, field)\

#define ENCODE_LLS_SIZE 6U
#define ENCODE_LLS(buf_out, lls )\
   ENCODE_UINT32_UNCOMMON(buf_out, lls, 0x1B );
#define _02_27_ENCODE_LLS(buf_out, lls )\
   ENCODE_LLS(buf_out, lls );

#define ENCODE_FLS_SIZE 6U
#define ENCODE_FLS(buf_out, fls )\
   ENCODE_UINT32_UNCOMMON(buf_out, fls, 0x1A );
#define _02_26_ENCODE_FLS(buf_out, fls )\
   ENCODE_FLS(buf_out, fls );

#define ENCODE_TAG_SRC_SIZE 5
#define ENCODE_TAG_SRC(buf_out, tag )\
   ENCODE_UINT32_COMMON(buf_out, tag, 0x3U );
#define _02_03_ENCODE_TAG_SRC(buf_out, tag )\
   ENCODE_TAG_SRC(buf_out, tag );

#define ENCODE_TAG_DST_SIZE 5
#define ENCODE_TAG_DST(buf_out, tag )\
   ENCODE_UINT32_COMMON(buf_out, tag, 0xEU );
#define _02_14_ENCODE_TAG_DST(buf_out, tag )\
   ENCODE_TAG_DST(buf_out, tag );

#define ENCODE_SEQUENCE_SIZE 5
#define ENCODE_SEQUENCE(buf_out, sequence )\
   ENCODE_UINT32_COMMON(buf_out, sequence, 0x4U );
#define _02_04_ENCODE_SEQUENCE(buf_out, sequence )\
   ENCODE_SEQUENCE(buf_out, sequence );

#define ENCODE_FLAGS_SIZE 5
#define ENCODE_FLAGS(buf_out, tag )\
   ENCODE_UINT32_COMMON(buf_out, tag, 0x2U );
#define _02_02_ENCODE_FLAGS(buf_out, tag )\
   ENCODE_FLAGS(buf_out, tag );

#define ENCODE_SIGNING_PUBKEY_SIZE 35
#define ENCODE_SIGNING_PUBKEY(buf_out, pkey )\
   {\
       buf_out[0] = 0x73U;\
       buf_out[1] = 0x21U;\
       *(uint64_t*)(buf_out +  2) = *(uint64_t*)(pkey +  0);\
       *(uint64_t*)(buf_out + 10) = *(uint64_t*)(pkey +  8);\
       *(uint64_t*)(buf_out + 18) = *(uint64_t*)(pkey + 16);\
       *(uint64_t*)(buf_out + 26) = *(uint64_t*)(pkey + 24);\
       buf[34] = pkey[32];\
       buf_out += ENCODE_SIGNING_PUBKEY_SIZE;\
   }

#define _07_03_ENCODE_SIGNING_PUBKEY(buf_out, pkey )\
   ENCODE_SIGNING_PUBKEY(buf_out, pkey );

#define ENCODE_SIGNING_PUBKEY_NULL_SIZE 35
#define ENCODE_SIGNING_PUBKEY_NULL(buf_out )\
   {\
       buf_out[0] = 0x73U;\
       buf_out[1] = 0x21U;\
       *(uint64_t*)(buf_out+2) = 0;\
       *(uint64_t*)(buf_out+10) = 0;\
       *(uint64_t*)(buf_out+18) = 0;\
       *(uint64_t*)(buf_out+25) = 0;\
       buf_out += ENCODE_SIGNING_PUBKEY_NULL_SIZE;\
   }

#define _07_03_ENCODE_SIGNING_PUBKEY_NULL(buf_out )\
   ENCODE_SIGNING_PUBKEY_NULL(buf_out );


#define PREPARE_PAYMENT_SIMPLE_SIZE 270
#define PREPARE_PAYMENT_SIMPLE(buf_out_master, drops_amount_raw, drops_fee_raw, to_address, dest_tag_raw, src_tag_raw)\
   {\
       uint8_t* buf_out = buf_out_master;\
       uint8_t acc[20];\
       uint64_t drops_amount = (drops_amount_raw);\
       uint64_t drops_fee = (drops_fee_raw);\
       uint32_t dest_tag = (dest_tag_raw);\
       uint32_t src_tag = (src_tag_raw);\
       uint32_t cls = (uint32_t)ledger_seq();\
       hook_account(SBUF(acc));\
       _01_02_ENCODE_TT                   (buf_out, ttPAYMENT                      );      /* uint16  | size   3 */ \
       _02_02_ENCODE_FLAGS                (buf_out, tfCANONICAL                    );      /* uint32  | size   5 */ \
       _02_03_ENCODE_TAG_SRC              (buf_out, src_tag                        );      /* uint32  | size   5 */ \
       _02_04_ENCODE_SEQUENCE             (buf_out, 0                              );      /* uint32  | size   5 */ \
       _02_14_ENCODE_TAG_DST              (buf_out, dest_tag                       );      /* uint32  | size   5 */ \
       _02_26_ENCODE_FLS                  (buf_out, cls + 1                        );      /* uint32  | size   6 */ \
       _02_27_ENCODE_LLS                  (buf_out, cls + 5                        );      /* uint32  | size   6 */ \
       _06_01_ENCODE_DROPS_AMOUNT         (buf_out, drops_amount                   );      /* amount  | size   9 */ \
       _06_08_ENCODE_DROPS_FEE            (buf_out, drops_fee                      );      /* amount  | size   9 */ \
       _07_03_ENCODE_SIGNING_PUBKEY_NULL  (buf_out                                 );      /* pk      | size  35 */ \
       _08_01_ENCODE_ACCOUNT_SRC          (buf_out, acc                            );      /* account | size  22 */ \
       _08_03_ENCODE_ACCOUNT_DST          (buf_out, to_address                     );      /* account | size  22 */ \
       etxn_details((uint32_t)buf_out, 138);                                               /* emitdet | size 138 */ \
   }

#define PREPARE_PAYMENT_SIMPLE_TRUSTLINE_SIZE 309
#define PREPARE_PAYMENT_SIMPLE_TRUSTLINE(buf_out_master, tlamt, drops_fee_raw, to_address, dest_tag_raw, src_tag_raw)\
   {\
       uint8_t* buf_out = buf_out_master;\
       uint8_t acc[20];\
       uint64_t drops_fee = (drops_fee_raw);\
       uint32_t dest_tag = (dest_tag_raw);\
       uint32_t src_tag = (src_tag_raw);\
       uint32_t cls = (uint32_t)ledger_seq();\
       hook_account(SBUF(acc));\
       _01_02_ENCODE_TT                   (buf_out, ttPAYMENT                      );      /* uint16  | size   3 */ \
       _02_02_ENCODE_FLAGS                (buf_out, tfCANONICAL                    );      /* uint32  | size   5 */ \
       _02_03_ENCODE_TAG_SRC              (buf_out, src_tag                        );      /* uint32  | size   5 */ \
       _02_04_ENCODE_SEQUENCE             (buf_out, 0                              );      /* uint32  | size   5 */ \
       _02_14_ENCODE_TAG_DST              (buf_out, dest_tag                       );      /* uint32  | size   5 */ \
       _02_26_ENCODE_FLS                  (buf_out, cls + 1                        );      /* uint32  | size   6 */ \
       _02_27_ENCODE_LLS                  (buf_out, cls + 5                        );      /* uint32  | size   6 */ \
       _06_01_ENCODE_TL_AMOUNT            (buf_out, tlamt                          );      /* amount  | size  48 */ \
       _06_08_ENCODE_DROPS_FEE            (buf_out, drops_fee                      );      /* amount  | size   9 */ \
       _07_03_ENCODE_SIGNING_PUBKEY_NULL  (buf_out                                 );      /* pk      | size  35 */ \
       _08_01_ENCODE_ACCOUNT_SRC          (buf_out, acc                            );      /* account | size  22 */ \
       _08_03_ENCODE_ACCOUNT_DST          (buf_out, to_address                     );      /* account | size  22 */ \
       etxn_details((uint32_t)buf_out, 138);                                               /* emitdet | size 138 */ \
   }



#endif

`;
