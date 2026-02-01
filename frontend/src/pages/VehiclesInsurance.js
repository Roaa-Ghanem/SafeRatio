import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import VehicleForm from "../components/VehicleForm";
import PremiumCalculator from "../components/PremiumCalculator";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Dashboard.css";
import "./VehiclesInsurance.css";
import CarInsurancePolicyPdf from '../components/CarInsurancePolicyPdf';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';

// دالة لاختبار الـ token
const testToken = async () => {
  const token = localStorage.getItem('access_token');
  console.log('🧪 Testing token:', token);
  
  if (!token) {
    console.error('❌ No token found');
    return false;
  }
  
  try {
    // اختبار بسيط
    const response = await fetch('http://localhost:8000/api/auth/token/verify/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    
    if (response.ok) {
      console.log('✅ Token is valid');
      return true;
    } else {
      console.error('❌ Token is invalid');
      return false;
    }
  } catch (error) {
    console.error('❌ Token test error:', error);
    return false;
  }
};

function VehiclesInsurance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vehicles");
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [error, setError] = useState("");
  const [acceptingQuoteId, setAcceptingQuoteId] = useState(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteDetails, setQuoteDetails] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // States جديدة لعرض تفاصيل Policy في نفس التاب
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [policyDetail, setPolicyDetail] = useState(null);
  const [showPolicyDetail, setShowPolicyDetail] = useState(false);
  const [loadingPolicyDetail, setLoadingPolicyDetail] = useState(false);
  const [showPolicyPdf, setShowPolicyPdf] = useState(false);
  const [selectedPolicyData, setSelectedPolicyData] = useState(null);
  // States جديدة لتبويب أنواع التأمين
  const [insuranceTypes, setInsuranceTypes] = useState([
    {
      id: 'comprehensive',
      name: 'وثيقة تأمين سيارات ضد الفقد والتلف والمسؤولية المدنية (شامل)',
      icon: '🛡️',
      description: 'تغطية شاملة للسيارة ضد الفقد والتلف والمسؤولية المدنية تجاه الغير',
      features: [
        'تغطية ضد الفقد أو التلف للمركبة المؤمن عليها',
        'تغطية ضد الحريق والانفجار والسرقة',
        'تغطية المسؤولية المدنية تجاه الغير',
        'تغطية تكاليف النقل والإصلاح',
        'شامل السائق والركاب (خيار إضافي)'
      ],
      document: 'full_comprehensive' // مرجع للوثيقة الكاملة
    },
    {
      id: 'third_party',
      name: 'وثيقة تأمين سيارات ضد المسؤولية المدنية (طرف ثالث)',
      icon: '👤',
      description: 'تغطية للمسؤولية المدنية تجاه الغير فقط',
      features: [
        'تغطية المسؤولية المدنية تجاه الغير فقط',
        'تغطية الوفاة والإصابات البدنية للغير',
        'تغطية الأضرار التي تصيب ممتلكات الغير',
        'تغطية أقل تكلفة من الشامل'
      ],
      document: 'third_party_only'
    }
  ]);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");

      // ⭐⭐ **فحص جميع أماكن تخزين الـ tokens**
      const accessToken = localStorage.getItem('access_token') || 
                        localStorage.getItem('accessToken') || 
                        localStorage.getItem('token');
      
      console.log('🔍 Tokens in localStorage:', {
        access_token: localStorage.getItem('access_token')?.substring(0, 20) + '...',
        accessToken: localStorage.getItem('accessToken')?.substring(0, 20) + '...',
        token: localStorage.getItem('token')?.substring(0, 20) + '...',
        username: localStorage.getItem('username')
      });

      if (!accessToken) {
        setError("No authentication token found. Please login again.");
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
        setLoading(false);
        return;
      }

      console.log('🔑 Using token:', accessToken.substring(0, 20) + '...');

      // استخدام axios بسيط
      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      // جلب البيانات في نفس الوقت
      const [vehiclesRes, quotesRes, policiesRes] = await Promise.all([
        axios.get('http://localhost:8000/api/car-insurance/vehicles/', config),
        axios.get('http://localhost:8000/api/car-insurance/quotes/', config),
        axios.get('http://localhost:8000/api/car-insurance/policies/', config)
      ]);

      console.log('✅ Data loaded:', {
        vehicles: vehiclesRes.data.length,
        quotes: quotesRes.data.length,
        policies: policiesRes.data.length
      });

      setVehicles(vehiclesRes.data);
      setQuotes(quotesRes.data);
      setPolicies(policiesRes.data);

    } catch (error) {
      console.error("❌ Error fetching data:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        
        // محاولة تحديث الـ token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('🔄 Attempting token refresh...');
          try {
            const refreshRes = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
              refresh: refreshToken
            });
            
            const newAccessToken = refreshRes.data.access;
            localStorage.setItem('access_token', newAccessToken);
            console.log('✅ Token refreshed, retrying...');
            
            // إعادة المحاولة
            fetchUserData();
            return;
            
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError.response?.data);
          }
        }
        
        // إذا فشل التحديث، الانتقال للدخول
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        
      } else {
        setError("Failed to load data. Please try again.");
      }
      
    } finally {
      setLoading(false);
    }
  };

  

  // دالة لجلب تفاصيل Policy وعرضها في نفس التاب
  const fetchAndShowPolicyDetail = async (policyId) => {
    try {
      setLoadingPolicyDetail(true);
      console.log('📥 Fetching policy details for:', policyId);
      
      // جلب بيانات الـ policy
      const response = await api.get(`/api/car-insurance/policies/${policyId}/`);
      console.log('✅ Policy data fetched:', response.data);
      
      // حفظ البيانات وعرضها
      setPolicyDetail(response.data);
      setSelectedPolicyId(policyId);
      setShowPolicyDetail(true);
      
      // تأكد أننا في policies tab
      setActiveTab("policies");
      
    } catch (error) {
      console.error('❌ Error fetching policy:', error);
      
      let errorMessage = 'Failed to load policy details. ';
      if (error.response?.status === 401) {
        errorMessage += 'Your session has expired.';
      } else if (error.response?.data?.detail) {
        errorMessage += error.response.data.detail;
      }
      
      alert(`❌ ${errorMessage}`);
      
      // العودة إلى قائمة الـ policies
      setShowPolicyDetail(false);
      setPolicyDetail(null);
      
    } finally {
      setLoadingPolicyDetail(false);
    }
  };

  const handleVehicleAdded = (newVehicle) => {
    setVehicles([newVehicle, ...vehicles]);
    setShowVehicleForm(false);
    setSelectedVehicle(newVehicle);
    setActiveTab("calculator");
    setShowCalculator(true);
  };

  const handleGetQuote = (vehicle) => {
    setSelectedVehicle(vehicle);
    setActiveTab("calculator");
    setShowCalculator(true);
  };

  const handleQuoteCreated = () => {
    fetchUserData();
    setShowCalculator(false);
    setActiveTab("quotes");
  };

  // دالة عرض الوثيقة القانونية
  const showInsuranceDocument = (docType) => {
    setSelectedDocument(docType);
    setShowDocumentModal(true);
  };

  // محتوى الوثائق القانونية
  const getDocumentContent = (docType) => {
    const documents = {
      'full_comprehensive': `
        <div dir="rtl" style="padding: 20px; max-width: 800px; margin: 0 auto; line-height: 1.8; font-family: 'Arial', sans-serif;">
          <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">وثيقة تأمين سيارات ضد الفقد والتلف والمسؤولية المدنية (شامل)</h1>
          
          <div style="background: #f8f9fa; padding: 15px; border-right: 4px solid #3498db; margin-bottom: 20px;">
            <p style="font-weight: bold; color: #2c3e50;">على المؤمن له قراءة هذه الوثيقة وملحقاتها للتأكد من أنها تفي بمتطلباته التي اتفق عليها</p>
          </div>
          
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">التمهيد</h2>
          <p>لما كان الشخص المؤمن له المذكور في الجدول المربوط بهذه البوليصة قد راجع شركة التأمين المسماة فيما يلي "الشركة" بموجب طلب خطي ووافق على أن يكون ذلك الطلب ذا صفة تعهدية وأساساً لعقد التأمين وداخلاً ضمنه، وقد دفع أو وافق على أن يدفع قسط التأمين المذكور في الجدول لقاء التعويض والشروط الوارد ذكرها فيما يلي:</p>
          <p>وعليه مع مراعاة القيود والشروط والأحكام المدرجة في هذه البوليصة أو المظهرة عليها، تتعهد الشركة بأن تعوض المؤمن له مما يحدث أو ينشأ من التلف والضرر أو المسؤولية كما مفصل أدناه خلال المدة المبينة في الجدول المربوط بهذه البوليصة أو خلال أية مدة توافق الشركة على القبض أجرة التجديد عنها.</p>
          
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 30px;">الفصل الأول: الفقد أو التلف للمركبة المؤمنة</h2>
          <div style="margin-right: 20px;">
            <h3>1. التزامات الشركة:</h3>
            <p>تلتزم الشركة بتعويض المؤمن له عن الفقد أو التلف الذي يلحق بالمركبة المؤمن عليها وملحقاتها وقطع غيارها في أثناء وجودها فيها وذلك في الحالات التالية:</p>
            <ul style="list-style-type: arabic-indic; padding-right: 30px;">
              <li>إذا نتج الفقد أو التلف عن حادث عرضي أو عن تصادم أو انقلاب حدث نتيجة لعطب ميكانيكي طارئ أو نتيجة اهتراء الأجزاء بالاستعمال.</li>
              <li>إذا نتج الفقد أو التلف عن حريق أو انفجار خارجي أو الاشتعال الذاتي أو الصاعقة.</li>
              <li>إذا نتج الفقد أو التلف عن السطو أو السرقة.</li>
              <li>إذا نتج الفقد أو التلف عن فعل متعمد صادر عن الغير.</li>
              <li>إذا حدث الفقد أو التلف في أثناء النقل البري أو النقل المائي الداخلي أو النقل بالمصاعد أو بالآلات الرافعة.</li>
            </ul>
            
            <h3>2. طريقة التعويض:</h3>
            <p>تدفع الشركة قيمة الفقد أو التلف نقداً للمؤمن له أو تقوم بإصلاح المركبة وإعادتها إلى حالتها أو استبدالها كلها أو أي من أجزائها أو ملحقاتها أو قطع غيارها على أن لا تتعدى مسؤولية الشركة قيمة استبدال الأجزاء المفقودة أو التالفة المعقولة لتركيب هذه الأجزاء.</p>
            
            <h3>3. إصلاح المؤمن له:</h3>
            <p>للمؤمن له أن يتولى إصلاح الأضرار التي تلحق بالمركبة نتيجة حادث مؤمن ضده بموجب هذه الوثيقة لتمكين المركبة من السير بقوتها الذاتية، وذلك بشرط أن لا تزيد القيمة المقدرة لتكاليف الإصلاح عن الحد الأقصى المصرح به في الجدول الملحق بهذه الوثيقة، وأن يقدم المؤمن له للشركة دون تأخير كشفاً مفصلاً بالقيمة المقدرة لتكاليف الإصلاح.</p>
          </div>
          
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 30px;">الفصل الثاني: المسؤولية المدنية</h2>
          <div style="margin-right: 20px;">
            <h3>1. نطاق التغطية:</h3>
            <p>تلتزم الشركة في حالة حدوث حادث نتج أو ترتب على استعمال المركبة المؤمن عليها بتعويض المؤمن له في حدود مسؤوليتها المنصوص عليها في هذه الوثيقة عن جميع المبالغ التي يتلزم المؤمن له قانوناً بدفعها بصفة تعويض عن:</p>
            <ul style="list-style-type: arabic-indic; padding-right: 30px;">
              <li>الوفاة أو أي إصابة بدنية تلحق بأي شخص بما في ذلك ركاب المركبة ما عدا المؤمن له شخصياً وقائد المركبة وقت الحادث وأفراد عائلتيهما.</li>
              <li>الأضرار التي تصيب الأشياء والممتلكات ما عدا المملوك منها للمؤمن له أو لقائد المركبة وقت الحادث.</li>
            </ul>
            
            <h3>2. امتداد التغطية:</h3>
            <p>يمتد التأمين المنصوص عليه في هذا الفصل في حدود الأحكام والشروط الواردة به إلى مسؤولية كل سائق مرخص له بالقيادة في أثناء قيامه بقيادة المركبة المؤمن عليها.</p>
          </div>
          
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-top: 30px;">الاستثناءات العامة</h2>
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="font-weight: bold;">لا يغطي هذا التأمين الحوادث في الحالات التالية:</p>
            <ul style="list-style-type: arabic-indic; padding-right: 30px;">
              <li>الحوادث خارج المنطقة الجغرافية المحددة</li>
              <li>الاشتراك في السباقات أو اختبارات السرعة</li>
              <li>القيادة من قبل شخص غير مرخص</li>
              <li>سحب مركبة أو جسم آخر</li>
              <li>القيادة تحت تأثير الكحول أو المخدرات</li>
              <li>الكوارث الطبيعية (الفيضانات، الزلازل، الأعاصير)</li>
              <li>الأعمال الحربية أو الإرهابية</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="font-weight: bold; color: #2c3e50;">عن / شركة التأمين</p>
            <p>في اليوم 00 من شهر ...... 2024</p>
          </div>
        </div>
      `,
      
      'third_party_only': `
        <div dir="rtl" style="padding: 20px; max-width: 800px; margin: 0 auto; line-height: 1.8; font-family: 'Arial', sans-serif;">
          <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">وثيقة تأمين سيارات ضد المسؤولية المدنية (طرف ثالث)</h1>
          <h2 style="text-align: center; color: #666; margin-bottom: 20px;">رقم الوثيقة: 101MO1 2022 000</h2>
          
          <div style="background: #f8f9fa; padding: 15px; border-right: 4px solid #e74c3c; margin-bottom: 20px;">
            <p style="font-weight: bold; color: #2c3e50;">على المؤمن له قراءة هذه الوثيقة وملحقاتها للتأكد من أنها تفي بمتطلباته التي اتفق عليها</p>
          </div>
          
          <h2 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">التمهيد</h2>
          <p>بما أن المؤمن له قد تقدم إلى شركة التأمين المشار إليها في هذا العقد باسم "الشركة" بطلب وإقرار لإبرام التأمين المبين فيها بعد، ووافق على اعتبارها أساساً لهذا العقد وجزءاً لا يتجزأ منه، ودفع أو قبل أن يدفع القسط المطلوب منه لقاء هذا التأمين.</p>
          <p>فقد أبرمت هذه الوثيقة لتغطية الحوادث التي تقع في الجمهورية اليمنية في أثناء هذا التأمين وطبقاً للأحكام والشروط والاستثناءات الواردة بهذه الوثيقة أو الملحقة بها.</p>
          
          <h2 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-top: 30px;">الأخطار المغطاة</h2>
          <div style="margin-right: 20px;">
            <h3>1. نطاق التغطية:</h3>
            <p>تلتزم الشركة في حالة حدوث حادث نتج أو ترتب على استعمال المركبة المؤمن عليها بتعويض المؤمن له في حدود مسؤولياتها المنصوص عليها في هذه الوثيقة عن جميع المبالغ التي يلتزم المؤمن له قانوناً بدفعها بصفة تعويض عن:</p>
            <ul style="list-style-type: arabic-indic; padding-right: 30px;">
              <li>الوفاة أو أي إصابة بدنية تلحق بأي شخص بما في ذلك ركاب المركبة (ما عدا المؤمن له شخصياً وقائد المركبة وقت الحادث وأفراد عائلتيهما).</li>
              <li>الأضرار التي تصيب الأشياء والممتلكات (ما عدا المملوك منها للمؤمن له أو لقائد المركبة وقت الحادث).</li>
            </ul>
            
            <h3>2. طريقة الدفع:</h3>
            <p>مع مراعاة الشرط الخاص بتحديد المسؤولية المنصوص عليه في الجدول الملحق بهذه الوثيقة، تلتزم الشركة بقيمة ما يحكم به قضائياً مهما بلغت قيمته بما في ذلك ما يطالب به المدعي من المصروفات القضائية والنفقات (ما عدا الغرامات).</p>
          </div>
          
          <h2 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-top: 30px;">الاستثناءات الخاصة</h2>
          <div style="background: #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="font-weight: bold;">لا تكون الشركة مسؤولة عن دفع أي تعويض بالنسبة ل:</p>
            <ul style="list-style-type: arabic-indic; padding-right: 30px;">
              <li>أية مسؤولية تترتب بمقتضى اتفاق أبرمه المؤمن له مع أي جهة</li>
              <li>الخسارة التبعية للغير أو الغرامات</li>
              <li>الأضرار التي تسببها حمولة المركبة</li>
              <li>الأضرار التي تصيب الطرق أو الجسور</li>
              <li>إصابة أو وفاة أي شخص أثناء عملية ركوب المركبة أو نزوله منها</li>
            </ul>
          </div>
          
          <h2 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-top: 30px;">الاستثناءات العامة</h2>
          <div style="background: #ffcccc; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="font-weight: bold;">لا يغطي هذا التأمين المسؤولية المدنية في الحالات التالية:</p>
            <ul style="list-style-type: arabic-indic; padding-right: 30px;">
              <li>الحوادث خارج المنطقة الجغرافية المحددة</li>
              <li>القيادة من قبل شخص غير مرخص</li>
              <li>القيادة تحت تأثير المشروبات الروحية أو المخدرات</li>
              <li>استعمال المركبة في غير الغرض المبين</li>
              <li>مخالفة قوانين السير والمرور</li>
              <li>الكوارث الطبيعية والأعمال الحربية</li>
            </ul>
          </div>
          
          <h2 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px; margin-top: 30px;">الشروط العامة</h2>
          <div style="margin-right: 20px;">
            <h3>1. شروط أساسية:</h3>
            <ul style="list-style-type: arabic-indic; padding-right: 30px;">
              <li>يجب أن تكون قيادة المركبة من قبل سائق مرخص</li>
              <li>يجب إخطار الشركة فور وقوع الحادث</li>
              <li>لا يجوز للمؤمن له الإقرار بالمسؤولية بدون موافقة الشركة</li>
              <li>للشركة الحق في إلغاء الوثيقة بإشعار مسبق</li>
            </ul>
            
            <h3>2. فئات أسعار التأمين قصير الأجل:</h3>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <thead>
                  <tr style="background: #2c3e50; color: white;">
                    <th style="padding: 10px; text-align: right;">مدة التأمين</th>
                    <th style="padding: 10px; text-align: right;">النسبة المئوية من القسط السنوي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">15 يوماً</td>
                    <td style="padding: 8px;">12.5%</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">شهر واحد</td>
                    <td style="padding: 8px;">25%</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">شهرين</td>
                    <td style="padding: 8px;">37.5%</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">ثلاثة شهور</td>
                    <td style="padding: 8px;">50%</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">أربعة شهور</td>
                    <td style="padding: 8px;">60%</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">خمسة شهور</td>
                    <td style="padding: 8px;">70%</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">ستة أشهر</td>
                    <td style="padding: 8px;">75%</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">سبعة أشهر</td>
                    <td style="padding: 8px;">80%</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px;">ثمانية أشهر</td>
                    <td style="padding: 8px;">85%</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px;">أكثر من ثمانية أشهر</td>
                    <td style="padding: 8px;">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="font-weight: bold; color: #2c3e50;">عن شركة التأمين</p>
            <p>2024 من شهر ....00 في اليوم</p>
          </div>
        </div>
      `
    };
    
    return documents[docType] || '<p>الوثيقة غير متاحة</p>';
  };

  // دالة لتحميل الوثيقة كملف PDF
  const downloadDocumentAsPDF = (docType, docName) => {
    const content = getDocumentContent(docType);
    const windowContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${docName}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.8;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1, h2, h3 {
            color: #2c3e50;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: right;
          }
          th {
            background: #2c3e50;
            color: white;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${content}
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
            🖨️ طباعة الوثيقة
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">
            ✕ إغلاق
          </button>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(windowContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // دالة عرض التفاصيل
  const handleViewDetails = async (quoteId) => {
    try {
      // 1. حفظ ID الاقتباس
      setSelectedQuoteId(quoteId);
      
      // 2. جلب تفاصيل الاقتباس من API
      const response = await api.get(`/api/car-insurance/quotes/${quoteId}/`);
      setQuoteDetails(response.data);
      
      // 3. عرض الـ modal
      setShowQuoteModal(true);
      
    } catch (error) {
      console.error('❌ Error fetching quote details:', error);
      alert('❌ Failed to load quote details');
    }
  };

  // دالة قبول الاقتباس - مصححة
  const handleAcceptQuote = async (quoteId) => {
    if (!window.confirm('Are you sure you want to accept this quote?')) {
      return;
    }
    
    setAcceptingQuoteId(quoteId);
    
    try {
      const response = await api.post(`/api/car-insurance/quotes/${quoteId}/accept/`);
      
      console.log('✅ Accept Quote Response:', response.data);
      
      if (response.data.success) {
        setSuccessMessage(response.data.message || 'Quote accepted successfully!');
        const policyData = response.data.policy || {};
        
        console.log('📋 Extracted policy data:', policyData);
        
        // تحديث قائمة الاقتباسات
        const updatedQuotes = quotes.map(quote => {
          if (quote.id === quoteId) {
            const updatedQuote = {
              ...quote,
              status: 'accepted',
              policy_info: policyData,  // أضف كـ policy_info
              policy_id: policyData.id || policyData.policy_number
            };

            console.log('✅ Updated quote in state:', updatedQuote);
            return updatedQuote;
            
          }
          return quote;
        });
        
        setQuotes(updatedQuotes);
        
        // إذا كان هناك policy، إظهار تفاصيله في policies tab
        if (policyData.id || policyData.policy_number) {
          const policyId = policyData.id || 1; // استخدام الافتراضي إذا لم يكن هناك ID
          
          // انتظر قليلاً ثم عرض تفاصيل الـ policy
          setTimeout(() => {
            fetchAndShowPolicyDetail(policyId);
          }, 1500);
        }
        
        // تحديث قائمة السياسات
        setTimeout(() => {
          fetchUserData();
        }, 1000);
        
      } else {
        throw new Error(response.data.message || 'Unknown error');
      }
      
    } catch (error) {
      console.error('❌ Error accepting quote:', error);
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.detail || 
                      error.message || 
                      'Failed to accept quote';
      alert(`❌ Error: ${errorMsg}`);
      
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  // دالة لفتح الـ certificate مع token
  const openCertificateWithToken = async (policyId) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    if (!token) {
      alert('❌ Please login again.');
      window.location.href = '/login';
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/car-insurance/policies/${policyId}/certificate/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        throw new Error('Failed to fetch certificate');
      }
    } catch (error) {
      console.error('Error opening certificate:', error);
      alert('❌ Cannot open certificate. The PDF might not be available yet.');
    }
  };

  // دالة إنشاء تقرير
  const handleGenerateReport = async (quoteId, format = 'html') => {
    console.log(`📊 Generating report for quote ${quoteId}, format: ${format}`);
    
    try {
      const response = await api.get(
        `/api/car-insurance/quotes/${quoteId}/generate_detailed_report/?format=${format}`,
        { 
          responseType: format === 'pdf' ? 'blob' : 'json',
          headers: {
            'Accept': format === 'pdf' ? 'application/pdf' : 'application/json'
          }
        }
      );
      
      console.log('✅ Report response:', response);
      
      if (format === 'pdf' && response.data instanceof Blob) {
        // تحميل ملف PDF
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `insurance_quote_${quoteId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else if (format === 'html' && response.data.report_html) {
        // عرض HTML في نافذة جديدة
        const reportWindow = window.open();
        reportWindow.document.write(response.data.report_html);
        reportWindow.document.close();
      } else if (response.data.html_report) {
        // عرض HTML بديل
        const reportWindow = window.open();
        reportWindow.document.write(response.data.html_report);
        reportWindow.document.close();
      } else {
        console.log('📋 Report data:', response.data);
        alert('✅ Report generated. Check console for details.');
      }
    } catch (error) {
      console.error('❌ Error generating report:', error);
      alert('❌ Failed to generate report. Please try again later.');
    }
  };

  // دالة لإغلاق رسالة النجاح
  const closeSuccessMessage = () => {
    setSuccessMessage("");
  };

  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        {/* رسالة النجاح */}
        {successMessage && (
          <div className="success-message">
            <span>✅ {successMessage}</span>
            <button className="close-btn" onClick={closeSuccessMessage}>✕</button>
          </div>
        )}
        
        {/* رسالة الخطأ */}
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
            <button className="close-btn" onClick={() => setError("")}>✕</button>
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <h1>🚗 Vehicle Insurance Management</h1>
          <p className="welcome-message">
            Welcome, {user?.first_name || user?.username}!
            <span className="account-badge">Personal Account</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "vehicles" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("vehicles");
              setShowPolicyDetail(false);
            }}
          >
            🚗 My Vehicles ({vehicles.length})
          </button>
          <button
            className={`tab ${activeTab === "quotes" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("quotes");
              setShowPolicyDetail(false);
            }}
          >
            💰 Insurance Quotes ({quotes.length})
          </button>
          <button
            className={`tab ${activeTab === "policies" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("policies");
            }}
          >
            📄 {showPolicyDetail ? 'Policy Details' : `Policies (${policies.length})`}
          </button>
          <button
            className={`tab ${activeTab === "insurance-types" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("insurance-types");
              setShowPolicyDetail(false);
            }}
          >
            📋 Insurance Types
          </button>
          <button
            className={`tab ${activeTab === "calculator" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("calculator");
              setShowCalculator(true);
              setShowPolicyDetail(false);
            }}
          >
            🧮 Premium Calculator
          </button>
        </div>

        {/* Vehicles Tab */}
        {activeTab === "vehicles" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>My Vehicles</h2>
              <button
                className="btn-primary"
                onClick={() => setShowVehicleForm(true)}
              >
                + Add New Vehicle
              </button>
            </div>

            {vehicles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🚗</div>
                <h3>No vehicles added yet</h3>
                <p>Add your first vehicle to get started with insurance</p>
                <button
                  className="btn-primary"
                  onClick={() => setShowVehicleForm(true)}
                >
                  Add Your First Vehicle
                </button>
              </div>
            ) : (
              <div className="vehicles-grid">
                {vehicles.map((vehicle) => (
                  <div key={`vehicle-${vehicle.id}`} className="vehicle-card"> {/* Fixed: Added key */}
                    <div className="vehicle-header">
                      <div className="vehicle-icon">
                        {vehicle.vehicle_type === "car" && "🚗"}
                        {vehicle.vehicle_type === "suv" && "🚙"}
                        {vehicle.vehicle_type === "truck" && "🚚"}
                        {vehicle.vehicle_type === "motorcycle" && "🏍️"}
                      </div>
                      <div className="vehicle-info">
                        <h3>{vehicle.make} {vehicle.model}</h3>
                        <p>{vehicle.year} • {vehicle.license_plate}</p>
                      </div>
                      <span className="vehicle-value">
                        ${parseFloat(vehicle.current_value).toLocaleString()}
                      </span>
                    </div>

                    <div className="vehicle-details">
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{vehicle.vehicle_type}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Fuel:</span>
                        <span className="detail-value">{vehicle.fuel_type}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Engine:</span>
                        <span className="detail-value">{vehicle.engine_size}L</span>
                      </div>
                    </div>

                    <div className="vehicle-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setActiveTab("calculator");
                          setShowCalculator(true);
                        }}
                      >
                        Get Quote
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => handleGetQuote(vehicle)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Quotes Tab */}
        {activeTab === "quotes" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Insurance Quotes</h2>
              <button 
                className="btn-refresh"
                onClick={fetchUserData}
                title="Refresh data"
              >
                🔄 Refresh
              </button>
            </div>

            {quotes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💰</div>
                <h3>No quotes yet</h3>
                <p>Get your first insurance quote for one of your vehicles</p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setActiveTab("vehicles");
                    setShowVehicleForm(true);
                  }}
                >
                  Add Vehicle & Get Quote
                </button>
              </div>
            ) : (
              <div className="quotes-grid">
                {quotes.map((quote) => (
                  <div key={`quote-${quote.id}`} className="quote-card">
                    <div className="quote-header">
                      <div className="quote-icon">📋</div>
                      <div className="quote-info">
                        <h3>Quote #{quote.quote_number}</h3>
                        <p>{quote.vehicle?.make || 'Unknown'} {quote.vehicle?.model || ''}</p>
                      </div>
                      <span className={`quote-status ${quote.status}`}>
                        {quote.status}
                      </span>
                    </div>

                    <div className="quote-details">
                      <div className="detail-row">
                        <span className="detail-label">Coverage:</span>
                        <span className="detail-value">{quote.coverage_type}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Premium:</span>
                        <span className="detail-value premium-amount">
                          ${parseFloat(quote.final_premium || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Excess:</span>
                        <span className="detail-value">
                          ${parseFloat(quote.excess_amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Valid Until:</span>
                        <span className="detail-value">
                          {quote.end_date ? new Date(quote.end_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="quote-actions">
                      {quote.status === 'quoted' && (
                        <div className="action-group">
                          <button 
                            className="btn-secondary"
                            onClick={() => handleViewDetails(quote.id)}
                            title="View full quote details"
                          >
                            <span className="icon">📋</span> View Details
                          </button>
                          <button 
                            className="btn-primary"
                            onClick={() => handleAcceptQuote(quote.id)}
                            disabled={acceptingQuoteId === quote.id}
                            title="Accept this quote and create insurance policy"
                          >
                            {acceptingQuoteId === quote.id ? (
                              <>
                                <span className="icon">⏳</span> Processing...
                              </>
                            ) : (
                              <>
                                <span className="icon">✅</span> Accept Quote
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {quote.status === 'accepted' && (
                        <div className="action-group">
                          <button 
                            className="btn-success"
                            onClick={() => {
                              if (quote.policy_info) {
                                const policyId = quote.policy_info.id || 1;
                                fetchAndShowPolicyDetail(policyId);
                              } else {
                                alert('❌ No policy information available. Please refresh the page.');
                              }
                            }}
                            title="View policy details in policies tab"
                          >
                            <span className="icon">📄</span> View Policy
                          </button>
                          {/* <button 
                            className="btn-outline"
                            onClick={() => handleGenerateReport(quote.id, 'html')}
                            title="Download policy document"
                          >
                            <span className="icon">📥</span> Download Report
                          </button> */}
                        </div>
                      )}
                      
                      {quote.status === 'expired' && (
                        <button 
                          className="btn-secondary"
                          onClick={() => {
                            setSelectedVehicle(quote.vehicle);
                            setActiveTab("calculator");
                            setShowCalculator(true);
                          }}
                          title="Get a new insurance quote"
                        >
                          <span className="icon">🔄</span> Get New Quote
                        </button>
                      )}
                      
                      {quote.status === 'pending' && (
                        <button className="btn-warning" disabled>
                          <span className="icon">⏳</span> Processing...
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === "policies" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>
                {showPolicyDetail && policyDetail 
                  ? `Policy Details: ${policyDetail.policy_number}` 
                  : 'Active Policies'
                }
                {showPolicyDetail && (
                  <button 
                    className="btn-back"
                    onClick={() => {
                      setShowPolicyDetail(false);
                      setPolicyDetail(null);
                    }}
                  >
                    ← Back to List
                  </button>
                )}
              </h2>
              {!showPolicyDetail && (
                <button 
                  className="btn-refresh"
                  onClick={fetchUserData}
                  title="Refresh policies"
                >
                  🔄 Refresh
                </button>
              )}
            </div>

            {showPolicyDetail ? (
              loadingPolicyDetail ? (
                <div className="loading">Loading policy details...</div>
              ) : policyDetail ? (
                <div className="policy-detail-view">
                  <div className="detail-card">
                    <h3>Policy Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <strong>Policy Number:</strong> {policyDetail.policy_number}
                      </div>
                      <div className="detail-item">
                        <strong>Status:</strong>
                        <span className={`status-badge ${policyDetail.status}`}>
                          {policyDetail.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <strong>Vehicle:</strong>
                        {policyDetail.vehicle?.make} {policyDetail.vehicle?.model} ({policyDetail.vehicle?.license_plate})
                      </div>
                      <div className="detail-item">
                        <strong>Coverage Period:</strong>
                        {policyDetail.inception_date} to {policyDetail.expiry_date}
                      </div>
                      <div className="detail-item">
                        <strong>Total Premium:</strong> ${policyDetail.total_premium}
                      </div>
                      <div className="detail-item">
                        <strong>Payment Status:</strong> {policyDetail.payment_status}
                      </div>
                      <div className="detail-item">
                        <strong>Coverage Type:</strong> {policyDetail.quote?.coverage_type}
                      </div>
                      <div className="detail-item">
                        <strong>Created:</strong> {new Date(policyDetail.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="policy-detail-actions">
                    {/* <button 
                      className="btn-primary"
                      onClick={() => {
                        const policyId = policyDetail.id || policyDetail.policy_number;
                        openCertificateWithToken(policyId);
                      }}
                    >
                      📥 Download Certificate
                    </button> */}
                    <button 
                      className="btn-success"
                      onClick={() => {
                        setSelectedPolicyData(policyDetail);
                        setShowPolicyPdf(true);
                      }}
                      style={{ marginLeft: '10px' }}
                    >
                      📄 إنشاء وثيقة PDF
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => setShowPolicyDetail(false)}
                    >
                      ← Back to Policies List
                    </button>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">❌</div>
                  <h3>Policy not found</h3>
                  <p>The requested policy could not be loaded</p>
                  <button
                    className="btn-primary"
                    onClick={() => setShowPolicyDetail(false)}
                  >
                    Back to Policies
                  </button>
                </div>
              )
            ) : (
              <>
                {policies.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📄</div>
                    <h3>No policies yet</h3>
                    <p>Accept an insurance quote to get your first policy</p>
                    <button
                      className="btn-primary"
                      onClick={() => setActiveTab("quotes")}
                    >
                      View Quotes
                    </button>
                  </div>
                ) : (
                  <div className="policies-grid">
                    {policies.map((policy) => (
                      <div key={`policy-${policy.id}`} className="policy-card">
                        <div className="policy-header">
                          <div className="policy-icon">🛡️</div>
                          <div className="policy-info">
                            <h3>Policy #{policy.policy_number}</h3>
                            <p>
                              {policy.vehicle?.make || policy.quote?.vehicle?.make || 'Unknown'}{" "}
                              {policy.vehicle?.model || policy.quote?.vehicle?.model || ''}
                            </p>
                          </div>
                          <span className={`policy-status ${policy.status}`}>
                            {policy.status}
                          </span>
                        </div>

                        <div className="policy-details">
                          <div className="detail-row">
                            <span className="detail-label">Coverage:</span>
                            <span className="detail-value">
                              {policy.quote?.coverage_type || 'N/A'}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Premium:</span>
                            <span className="detail-value">
                              ${parseFloat(policy.total_premium || policy.quote?.final_premium || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Valid Until:</span>
                            <span className="detail-value">
                              {policy.expiry_date ? new Date(policy.expiry_date).toLocaleDateString() : 'N/A'}
                              {policy.expiry_date && (
                                <span className="days-remaining">
                                  ({Math.ceil((new Date(policy.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))} days left)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="policy-actions">
                          <button 
                            className="btn-secondary"
                            onClick={() => fetchAndShowPolicyDetail(policy.id)}
                          >
                            View Details
                          </button>
                          <button 
                            className="btn-outline"
                            onClick={() => {
                              setSelectedPolicyData(policy);
                              setShowPolicyPdf(true);
                            }}
                            style={{ marginLeft: '10px' }}
                          >
                            📄 Create PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Insurance Types Tab - الجديد */}
        {activeTab === "insurance-types" && (
          <div className="tab-content">
            <div className="section-header">
              <h2>أنواع وثائق تأمين السيارات</h2>
              <p className="section-description">
                اختر نوع التأمين المناسب لسيارتك واطلع على الوثيقة القانونية الكاملة
              </p>
            </div>

            <div className="insurance-types-grid">
              {insuranceTypes.map((type) => (
                <div key={`insurance-type-${type.id}`} className="insurance-type-card">
                  <div className="type-header">
                    <div className="type-icon">{type.icon}</div>
                    <div className="type-info">
                      <h3>{type.name}</h3>
                      <p className="type-description">{type.description}</p>
                    </div>
                  </div>

                  <div className="type-features">
                    <h4>✅ المميزات الرئيسية:</h4>
                    <ul>
                      {type.features.map((feature, index) => (
                        <li key={`${type.id}-feature-${index}`}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="type-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => showInsuranceDocument(type.document)}
                    >
                      📄 عرض الوثيقة القانونية
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => downloadDocumentAsPDF(type.document, type.name)}
                    >
                      📥 تحميل كملف PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* جدول مقارنة بين النوعين */}
            <div className="comparison-table" style={{ marginTop: '40px' }}>
              <h3>📊 مقارنة بين نوعي التأمين</h3>
              <table className="comparison">
                <thead>
                  <tr>
                    <th>الميزة</th>
                    <th>التأمين الشامل</th>
                    <th>تأمين طرف ثالث</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>تغطية الفقد أو التلف للسيارة</td>
                    <td className="yes">✅ شامل</td>
                    <td className="no">❌ غير مشمول</td>
                  </tr>
                  <tr>
                    <td>تغطية الحريق والسرقة</td>
                    <td className="yes">✅ شامل</td>
                    <td className="no">❌ غير مشمول</td>
                  </tr>
                  <tr>
                    <td>المسؤولية المدنية تجاه الغير</td>
                    <td className="yes">✅ شامل</td>
                    <td className="yes">✅ شامل</td>
                  </tr>
                  <tr>
                    <td>تغطية السائق والركاب</td>
                    <td className="optional">🔄 اختياري</td>
                    <td className="no">❌ غير مشمول</td>
                  </tr>
                  <tr>
                    <td>التكلفة التقريبية</td>
                    <td className="price">$$$ مرتفعة</td>
                    <td className="price">$ منخفضة</td>
                  </tr>
                  <tr>
                    <td>الملاءمة ل</td>
                    <td>السيارات الجديدة والقيمة العالية</td>
                    <td>السيارات القديمة والميزانية المحدودة</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* إرشادات الاختيار */}
            <div className="selection-guide" style={{ marginTop: '40px', background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
              <h3>🎯 كيف تختار النوع المناسب؟</h3>
              <div className="guide-cards">
                <div className="guide-card" style={{ background: '#e8f4fc', padding: '15px', borderRadius: '8px' }}>
                  <h4>اختر التأمين الشامل إذا:</h4>
                  <ul>
                    <li>🚗 سيارتك جديدة أو ذات قيمة عالية</li>
                    <li>💼 تريد حماية شاملة لاستثمارك</li>
                    <li>🛡️ تحتاج تغطية ضد الحوادث والسرقة</li>
                    <li>👨‍👩‍👧‍👦 تريد حماية إضافية للسائق والركاب</li>
                  </ul>
                </div>
                <div className="guide-card" style={{ background: '#e8f6e8', padding: '15px', borderRadius: '8px' }}>
                  <h4>اختر تأمين طرف ثالث إذا:</h4>
                  <ul>
                    <li>💰 ميزانيتك محدودة</li>
                    <li>🕰️ سيارتك قديمة (أكثر من 5 سنوات)</li>
                    <li>⚖️ تحتاج فقط لتغطية المسؤولية تجاه الغير</li>
                    <li>📋 تريد تغطية قانونية أساسية فقط</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === "calculator" && showCalculator && (
          <PremiumCalculator
            vehicle={selectedVehicle}
            onCancel={() => setShowCalculator(false)}
            onQuoteCreated={handleQuoteCreated}
          />
        )}
      </main>

      {/* Vehicle Form Modal */}
      {showVehicleForm && (
        <div className="modal-overlay">
          <VehicleForm
            onSuccess={handleVehicleAdded}
            onCancel={() => setShowVehicleForm(false)}
          />
        </div>
      )}

      {/* Quote Details Modal */}
      {showQuoteModal && quoteDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Quote Details: {quoteDetails.quote_number}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowQuoteModal(false);
                  setQuoteDetails(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="details-section">
                <h3>Vehicle Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Make:</strong> {quoteDetails.vehicle?.make || 'N/A'}
                  </div>
                  <div className="detail-item">
                    <strong>Model:</strong> {quoteDetails.vehicle?.model || 'N/A'}
                  </div>
                  <div className="detail-item">
                    <strong>Year:</strong> {quoteDetails.vehicle?.year || 'N/A'}
                  </div>
                  <div className="detail-item">
                    <strong>VIN:</strong> {quoteDetails.vehicle?.chassis_number || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="details-section">
                <h3>Quote Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Coverage Type:</strong> 
                    {quoteDetails.coverage_type_display || quoteDetails.coverage_type}
                  </div>
                  <div className="detail-item">
                    <strong>Premium:</strong>
                    <span className="highlight">${quoteDetails.final_premium}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Excess Amount:</strong> ${quoteDetails.excess_amount}
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span className={`status ${quoteDetails.status}`}>
                      {quoteDetails.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                {quoteDetails.status === 'quoted' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowQuoteModal(false);
                      handleAcceptQuote(quoteDetails.id);
                    }}
                  >
                    ✅ Accept Quote
                  </button>
                )}
                {/* <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowQuoteModal(false);
                    handleGenerateReport(quoteDetails.id, 'html');
                  }}
                >
                  📥 Download Report
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Document Modal */}
      {showDocumentModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
            <div className="modal-header">
              <h2>الوثيقة القانونية الكاملة</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDocumentModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body" dangerouslySetInnerHTML={{ __html: getDocumentContent(selectedDocument) }} />
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDocumentModal(false)}
              >
                إغلاق
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  const type = insuranceTypes.find(t => t.document === selectedDocument);
                  downloadDocumentAsPDF(selectedDocument, type?.name || 'وثيقة التأمين');
                }}
              >
                📥 تحميل كملف PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Car Insurance Policy PDF Modal */}
      {showPolicyPdf && (
        <div className="modal-overlay">
          <CarInsurancePolicyPdf 
            policyData={selectedPolicyData}
            onClose={() => setShowPolicyPdf(false)}
          />
        </div>
      )}
    </div>
  );
  
}

export default VehiclesInsurance;