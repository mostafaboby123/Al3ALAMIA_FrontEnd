import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./PersonalInformation.module.css";
import { updateUserDataApi } from "../../../redux/auth/authApis";
import image from "../../../assets/user.png";

const PersonalInformation = () => {
  const authData = useSelector((state) => state.auth);
  const user = authData?.user;


  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    age: "",
    phone: "",
    address: "",
  });
  const [tempFormData, setTempFormData] = useState(formData);

  // Synchronize formData with user data only when user exists
  useEffect(() => {
    if (user) {
      const newFormData = {
        username: user.username || "",
        email: user.email || "",
        age: user.age || "",
        phone: user.phoneNumber || "",
        address: user.address || "",
      };
      setFormData(newFormData);
      setTempFormData(newFormData);
    }
  }, [user, user.id]); // Depend on user.id to avoid re-runs on object reference change

  const handleEditClick = () => {
    setIsEditing(true);
    setTempFormData(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setFormData(tempFormData);
    setIsEditing(false);
    // TODO: Dispatch action to update user data in Redux store or backend
    dispatch(updateUserDataApi(tempFormData));
  };

  const handleCancel = () => {
    setTempFormData(formData);
    setIsEditing(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainSection}>
        <div className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarContainer}>
              <img src={image} alt="Profile" className={styles.avatar} />
            </div>
            <div className={styles.profileInfo}>
              <h3 className={styles.profileName}>{formData.username ? formData.username.split(" ")[0] : "-"}</h3>
              <p className={styles.profileEmail}>{formData.email || "-"}</p>
              <p className={styles.profilePhone}>{formData.phone || "-"}</p>
              <div className={styles.badges}>
                <span className={styles.badge}>Premium Member</span>
              </div>
              {isEditing ? (
                <div className={styles.editButtons}>
                  <button className={styles.saveBtn} onClick={handleSave}>
                    <i className="fas fa-save"></i> Save
                  </button>
                  <button className={styles.cancelBtn} onClick={handleCancel}>
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              ) : (
                <button className={styles.editBtn} onClick={handleEditClick}>
                  <i className="fas fa-pen"></i> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Personal Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoField}>
              <label className={styles.fieldLabel}>Full Name</label>
              {isEditing ? (
                <input type="text" name="username" value={tempFormData.username} onChange={handleInputChange} className={styles.input} />
              ) : (
                <div className={styles.fieldValue}>{formData.username || "-"}</div>
              )}
            </div>
            <div className={styles.infoField}>
              <label className={styles.fieldLabel}>Age</label>
              {isEditing ? (
                <input type="number" name="age" value={tempFormData.age} onChange={handleInputChange} className={styles.input} />
              ) : (
                <div className={styles.fieldValue}>{formData.age ? `${formData.age} years` : "-"}</div>
              )}
            </div>
            <div className={styles.infoField}>
              <label className={styles.fieldLabel}>Phone</label>
              {isEditing ? (
                <input type="tel" name="phone" value={tempFormData.phone} onChange={handleInputChange} className={styles.input} />
              ) : (
                <div className={styles.fieldValue}>{formData.phone || "-"}</div>
              )}
            </div>
            <div className={`${styles.infoField} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>Address</label>
              {isEditing ? (
                <input type="text" name="address" value={tempFormData.address} onChange={handleInputChange} className={styles.input} />
              ) : (
                <div className={styles.fieldValue}>{formData.address || "-"}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;
