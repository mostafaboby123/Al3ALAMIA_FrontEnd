import { useState } from 'react';
import { useSelector } from 'react-redux';
import PersonalInformation from './PersonalInformation/PersonalInformation';
import Invoices from './Invoices/Invoices';
import styles from './Profile.module.css';

const Profile = () => {
  const [activeSection] = useState('profile');
  const authData = useSelector(state => state.auth);
  const user = authData?.user || {};


  return (
    <div className={styles.container}>


      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.headerTitle}>
              {authData?.isAuthenticated ? `${user.username}'s Profile` : 'Patient Profile'}
            </h2>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className={styles.contentArea}>
          {(() => {
            switch (activeSection) {
              case 'profile':
                return <PersonalInformation />;
              case 'invoices':
                return <Invoices />;
              default:
                return <PersonalInformation />;
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default Profile;