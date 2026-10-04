'use client';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { LinkPending } from './request-progress';

export default function ProgressLink({ children, ...props }: ComponentProps<typeof Link>) {
 return <Link {...props}>{children}<LinkPending/></Link>;
}
