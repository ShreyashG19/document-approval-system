-   migrate from bcrypt to argon2 [done]
-   dont just rely on jwt token for auth but also check for user in DB [done]
-   token revokation on logout [done]
-   add isverified to all routes
-   specify role in email body
-   turn on validations
-   isActive isVerified validation middlewares
-   make all the attributes/values lowercase when saving to DB
-   make sure to not send password/private key in response
-   add timestamps to all the models
-   promoting assistant to senior assistant
-   delete notifications from database or not

-   Admin can create new senior assistant, only if any approver dont have senior assistant, or if
    previous sr. assitant is disabled
-   solution for frequent database calls, use redis for storing user active not active,
    only call the db when the entry is not found in redis
-   on login, store the user active (possibly whole userdata) in redis along with the jwt token

💡 Optimized Approach
Instead of checking the database every time, consider caching isActive in Redis.

🚀 Steps for Optimization
When user logs in → Cache isActive in Redis.
On each request → Check Redis instead of DB.
When admin updates isActive → Update Redis.
If Redis entry expires → Fetch from DB again.


- if admin deactivates account of an approver, he can add new approver
- after creation of new approver the old one cannot be re-activated, only one approver can be enabled at a time 


- update profile, terminate session (admin)
- get profile data for everyone
- change user status (admin)
- comment out send otp reset password
- while updating user, only following fields can be updated
    - fullName
    - mobileNo
    - email
    - password

## concerns
1. sending credentials to user secure?