import React from 'react';
import { useLocation } from 'wouter';
import { useDialect, DIALECTS } from '../context/DialectContext';
import { Globe, ArrowRight } from 'lucide-react';
import './DialectSelectionPage.css';

export const DialectSelectionPage: React.FC = () => {
    const { setDialect, currentDialect } = useDialect();
    const [, setLocation] = useLocation();

    const handleSelect = (id: any) => {
        setDialect(id);
        const progress = localStorage.getItem('arabic_app_progress');
        if (!progress || Object.keys(JSON.parse(progress)).length === 0) {
            setLocation('/placement-test');
        } else {
            setLocation('/');
        }
    };

    return (
        <div className="dialect-selection-page">
            <div className="selection-header">
                <Globe className="header-icon" size={48} />
                <h1>Choose Your Arabic Dialect</h1>
                <p>Arabic dialects vary significantly by region. Select the path that fits your goals.</p>
            </div>

            <div className="dialect-grid">
                {DIALECTS.map((dialect) => (
                    <div
                        key={dialect.id}
                        className={`dialect-card ${currentDialect === dialect.id ? 'active' : ''} ${dialect.comingSoon ? 'coming-soon' : ''}`}
                        onClick={() => !dialect.comingSoon && handleSelect(dialect.id)}
                        style={{ '--accent-color': dialect.color } as React.CSSProperties}
                    >
                        <div className="card-flag">{dialect.flag}</div>
                        <div className="card-content">
                            <div className="card-title-row">
                                <h2 className="card-name">{dialect.name}</h2>
                                <span className="card-arabic">{dialect.nameArabic}</span>
                            </div>
                            <p className="card-description">{dialect.description}</p>
                            <div className="card-footer">
                                <span>{dialect.comingSoon ? 'Coming Soon' : 'Start Learning'}</span>
                                {!dialect.comingSoon && <ArrowRight size={18} />}
                            </div>
                        </div>
                        {currentDialect === dialect.id && !dialect.comingSoon && <div className="active-badge">Current</div>}
                        {dialect.comingSoon && <div className="coming-soon-badge">Coming Soon</div>}
                    </div>
                ))}
            </div>

            <div className="selection-info">
                <p>Not sure? <strong>Modern Standard Arabic (MSA)</strong> is the best starting point for formal use, while <strong>Egyptian</strong> or <strong>Levantine</strong> are great for daily conversation.</p>
            </div>
        </div>
    );
};
