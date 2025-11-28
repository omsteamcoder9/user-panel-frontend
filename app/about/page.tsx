// pages/about.tsx or app/about/page.tsx

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
}

const AboutPage: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'John Doe',
      role: 'CEO & Founder',
      bio: 'John has over 10 years of experience in the industry.',
      image: '/images/a3.webp' // REMOVED /public from path
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'CTO',
      bio: 'Jane leads our technical team with expertise in modern web technologies.',
      image: '/images/a3.webp' // REMOVED /public from path
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Lead Designer',
      bio: 'Mike creates beautiful and functional user experiences.',
      image: '/images/a3.webp' // REMOVED /public from path
    }
  ];

  const stats = [
    { number: '5+', label: 'Years Experience' },
    { number: '100+', label: 'Projects Completed' },
    { number: '50+', label: 'Happy Clients' },
    { number: '24/7', label: 'Support' }
  ];

  return (
    <>
      <Head>
        <title>About Us - Our Company</title>
        <meta name="description" content="Learn more about our company, mission, and team" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                About Our Company
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                We are passionate about creating innovative solutions that make a difference
                in people&apos;s lives.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-4">
                  Our mission is to deliver exceptional value to our clients through 
                  innovative technology solutions and outstanding customer service.
                </p>
                <p className="text-lg text-gray-600">
                  We believe in pushing the boundaries of what&apos;s possible while 
                  maintaining the highest standards of quality and integrity.
                </p>
              </div>
              <div className="relative h-80">
                <Image
                  src="/images/a3.webp" // REMOVED /public from path
                  alt="Our Mission"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600">
                The talented people behind our success
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 relative rounded-full overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        
      </div>
    </>
  );
};

export default AboutPage;