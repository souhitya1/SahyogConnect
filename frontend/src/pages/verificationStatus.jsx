{user.verificationStatus === "pending" && (
    <p>Your verification is pending admin review.</p>
)}

{user.verificationStatus === "approved" && (
    <p>Your account has been verified.</p>
)}

{user.verificationStatus === "rejected" && (
    <p>
        Your application was rejected.
        Please review the feedback and contact support if needed.
    </p>
)}