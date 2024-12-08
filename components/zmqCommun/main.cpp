#include <iostream>
#include <string>
#include <openssl/sha.h>
#include <ctime>
#include <cstdlib>
#include <curl/curl.h>
#include "../wsDbConfig/wsDbConfig.h"
#include <jwt-cpp/jwt.h>
#include <random>

// Hashing the password using SHA-256
std::string hash_password(const std::string& password) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char*>(password.c_str()), password.size(), hash);

    std::string hashed_password;
    for (int i = 0; i < SHA256_DIGEST_LENGTH; ++i) {
        char buffer[3];
        snprintf(buffer, sizeof(buffer), "%02x", hash[i]);
        hashed_password += buffer;
    }
    return hashed_password;
}

class wsLogin {
public:
    std::string verify_credentials(wsDbConfig& dbConfig, const std::string& email,const std::string& whatsappnumber, const std::string& password) {
        try {
            pqxx::work W(*dbConfig.getConnection());  // Start transaction

            std::string hashed_password = hash_password(password);
        std::string query = "SELECT password, email, whatsappnumber, two_factor_enabled FROM users WHERE email = " + W.quote(email) + " OR whatsappnumber = " + W.quote(whatsappnumber) + ";";
            pqxx::result R = W.exec(query);

            if (!R.empty()) {
        std::string stored_hashed_password = R[0][0].as<std::string>(); // Assuming password cannot be null
    std::string user_email;
    if (!R[0][1].is_null()) {
        user_email = R[0][1].as<std::string>(); // Check if email is not null before conversion
    }
    std::string user_whatsapp_number;
    if (!R[0][2].is_null()) {
        user_whatsapp_number = R[0][2].as<std::string>(); // Check if WhatsApp number is not null before conversion
    }
    bool two_factor_enabled = R[0][3].as<bool>();
    bool valid_credentials = stored_hashed_password == hashed_password;

                if (valid_credentials) {
                    std::string code = generate_code(); // Generate a 6-digit code


        // Send the OTP based on the user's preference
        if (two_factor_enabled && !user_whatsapp_number.empty()) {
            // If WhatsApp number is available, send the code via WhatsApp
            send_whatsapp_notification(user_whatsapp_number, code); // Send WhatsApp 2FA code
        } else if (!user_email.empty()) {
            // If email is available and WhatsApp is not used, send via email
            send_registration_email(user_email, code); // Send OTP via email
        } else {
            // Neither contact method is available
            return "//nfa"; // No valid contact method available
        }

                    // Store OTP and expiration in 'templvc' table
                    std::time_t now = std::time(nullptr);
                    std::time_t expiration_time = now + (5 * 60); // OTP expires in 5 minutes

                    std::string check_email_query =
    "SELECT COUNT(*) FROM templvc WHERE email = "
    + W.quote(user_email.empty() || user_email == "null" ? user_whatsapp_number : user_email) + ";";

                    pqxx::result check_result = W.exec(check_email_query);
std::string identifier = !user_email.empty() && user_email != "null" ? user_email :
                         (!user_whatsapp_number.empty() && user_whatsapp_number != "null" ? user_whatsapp_number : "");

if (!identifier.empty()) {
    // Check if the result is not empty and the first result's value is greater than 0
    if (!check_result.empty() && check_result[0][0].as<int>() > 0) {
        // Update existing OTP record
        std::string update_otp_query =
            "UPDATE templvc SET otp = " + W.quote(code) + ", exp = to_timestamp(" + W.quote(std::to_string(expiration_time)) + ") "
            "WHERE email = " + W.quote(identifier) + ";";
        W.exec(update_otp_query);
    } else {
        // Insert new OTP record
        std::string insert_otp_query =
            "INSERT INTO templvc (email, otp, exp) VALUES ("
            + W.quote(identifier) + ", "
            + W.quote(code) + ", "
            + "to_timestamp(" + W.quote(std::to_string(expiration_time)) + "));";
        W.exec(insert_otp_query);
    }
} else {
    // Handle cases where both email and WhatsApp number are invalid or contain "null"
    throw std::runtime_error("Invalid email or WhatsApp number");
}
                    W.commit();
                    return generateToken(user_email); // Return JWT token
                } else {
                    return "wrng"; // Invalid password or username
                }
            } else {
                return "anf"; // No user found with the provided email
            }
        } catch (const std::exception &e) {
            std::cerr << "Database error: " << e.what() << std::endl;
            return "dbe"; // Handle database-related error cases
        }
    }

private:
    std::string generate_code() {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<int> dis(100000, 999999);
        return std::to_string(dis(gen));
    }

    void send_whatsapp_notification(const std::string& whatsapp_number, const std::string& code) {
        std::string payload = R"(
        {
            "messages": [
                {
                    "from": "79998357806",
                    "to": ")" + whatsapp_number + R"(",
                    "messageId": "a28dd97c-1ffb-4fcf-99f1-0b557ed381da",
                    "content": {
                        "templateName": "authwer",
                        "templateData": {
                            "body": {
                                "placeholders": [")" + code + R"("]
                            },
                            "buttons": [
                                {
                                    "type": "URL",
                                    "parameter": "199267"
                                }
                            ]
                        },
                        "language": "en_GB"
                    },
                    "callbackData": "Callback data"
                }
            ]
        })";

        send_post_request("https://api.infobip.com/whatsapp/1/message/template", payload, {
            "Content-Type: application/json",
            "Authorization: App 3a89d2b38ed86fcaef0c73a821b07211-6aa90923-9074-4dd6-8b06-9556410bd78c" // Move to secure storage in production
        });
    }


    void send_post_request(const std::string& url, const std::string& payload, const std::vector<std::string>& headers) {
        CURL* curl = curl_easy_init();
        if (curl) {
            struct curl_slist* curl_headers = nullptr;
            for (const auto& header : headers) {
                curl_headers = curl_slist_append(curl_headers, header.c_str());
            }

            curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
            curl_easy_setopt(curl, CURLOPT_POSTFIELDS, payload.c_str());
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, curl_headers);

            CURLcode res = curl_easy_perform(curl);
            if (res != CURLE_OK) {
                std::cerr << "Failed to send request: " << curl_easy_strerror(res) << std::endl;
            }

            curl_slist_free_all(curl_headers); // Free headers after the request
            curl_easy_cleanup(curl);
        }
    }
void send_registration_email(const std::string& email, const std::string& code) {
    CURL* curl;
    CURLcode res;
    const std::string smtp_server = "smtp://smtp.hostinger.com:587";
    const std::string smtp_username = "auth@cashly.me";
    const std::string password = "QjVP!04c4N1BGrp2DJXV*Qsd7GiPzzW4SbxgeF8UBilA!t3RB";
    std::string from = "auth@cashly.me";
    std::string subject = "Your OTP Code";

    // Construct the body for the OTP email
    std::string body = "Dear User,\n"
                       "Your OTP code is: " + code + "\n"
                       "Please use this code to complete your login process.\n"
                       "If you did not make this request, you can ignore this email.\n"
                       "Thank you for using our service!\n"
                       "Visit our website at https://casly.me to receive support or report issues.";

    // Construct the email payload
    std::string empayload = "To: " + email + "\r\n" +
                            "From: " + from + "\r\n" +
                            "Subject: " + subject + "\r\n" +
                            "MIME-Version: 1.0\r\n" +
                            "Content-Type: text/plain; charset=UTF-8\r\n" +
                            "\r\n" + body;

    // Initialize CURL
    curl = curl_easy_init();
    if (curl) {
        struct curl_slist *recipients = curl_slist_append(nullptr, email.c_str());
        curl_easy_setopt(curl, CURLOPT_URL, smtp_server.c_str());
        curl_easy_setopt(curl, CURLOPT_USERNAME, smtp_username.c_str());
        curl_easy_setopt(curl, CURLOPT_PASSWORD, password.c_str());
        curl_easy_setopt(curl, CURLOPT_MAIL_FROM, from.c_str());
        curl_easy_setopt(curl, CURLOPT_MAIL_RCPT, recipients);
        curl_easy_setopt(curl, CURLOPT_READFUNCTION, payload_read_callback);
        curl_easy_setopt(curl, CURLOPT_READDATA, &empayload);  // Pass the correct payload variable
        curl_easy_setopt(curl, CURLOPT_UPLOAD, 1L);
        curl_easy_setopt(curl, CURLOPT_VERBOSE, 1L);

        // Perform the email sending
        res = curl_easy_perform(curl);

        // Check for errors
        if (res != CURLE_OK) {
            fprintf(stderr, "curl_easy_perform() failed: %s\n", curl_easy_strerror(res));
        }

        // Clean up
        curl_slist_free_all(recipients);
        curl_easy_cleanup(curl);
    }
}

// Callback for reading the payload for the email sending
static size_t payload_read_callback(void* ptr, size_t size, size_t nmemb, std::string* userp) {
    size_t total_size = size * nmemb;
    if (userp->empty()) return 0;  // Return 0 if the payload is empty
    size_t to_copy = std::min(total_size, userp->size());
    std::memcpy(ptr, userp->c_str(), to_copy);
    userp->erase(0, to_copy);  // Erase the copied part
    return to_copy;  // Return how much was copied
}


    std::string generateToken(const std::string& username) {
        std::string token = jwt::create()
            .set_issuer("auth0")
            .set_type("JWS")
            .set_payload_claim("username", jwt::claim(username))
            .sign(jwt::algorithm::hs256{"G$8a9Zq5@dR3^yX!7wKj*Ue2#fH6%tLp"}); // Replace with a secure method of storing the secret
        return token;
    }
};

#endif